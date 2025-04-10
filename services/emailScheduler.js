import Agenda from "agenda";
import nodemailer from "nodemailer";
import Sequence from "../models/sequence.model.js";
import Config from "../config/envConfig.js";

const agenda = new Agenda({
  db: {
    address: Config.MONGODB_URI,
    collection: "emailJobs",
  },
});

const createTransport = () => {
  const { NODEMAILER_HOST, NODEMAILER_PASS, NODEMAILER_PORT, NODEMAILER_USER } =
    Config;

  if (
    !NODEMAILER_HOST ||
    !NODEMAILER_PORT ||
    !NODEMAILER_PASS ||
    !NODEMAILER_USER
  ) {
    throw new Error("Missing email configuration environment variables");
  }

  return nodemailer.createTransport({
    host: NODEMAILER_HOST,
    port: Number(NODEMAILER_PORT),
    secure: NODEMAILER_PORT === 465,
    auth: {
      user: NODEMAILER_USER,
      pass: NODEMAILER_PASS,
    },
  });
};

agenda.define("send email", async (job) => {
  const { to, subject, text } = job.attrs.data;

  if (!to || !subject) {
    console.error("Missing required email parameters", { to, subject });
    return;
  }

  try {
    const transport = createTransport();

    const mailOptions = {
      from: "test@test.com",
      to,
      text,
      subject,
    };

    const info = await transport.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.response}`);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
});

const extractEmailFromLeadSource = (node) => {
  if (!node?.data?.label) return null;

  const matches = node.data.label.match(/\(([^)]+@[^)]+)\)/);

  console.log(`Extracted email: ${matches?.[1]}`);
  return matches?.[1] || null;
};

const extractSubjectFromNode = (node) => {
  const matches = node.data.label.match(/\n- \(([^)]+)\)/);
  return matches?.[1] || "No Subject";
};

const extractTextFromNode = (node) => {
  const parts = node.data.label.split(") ");
  return parts.length > 1 ? parts[1] : "";
};

const extractDelayFromNode = (node) => {
  const matches = node.data.label.match(/- \((\d+) min/);
  const minutes = matches ? parseInt(matches[1], 10) : 0;
  return minutes * 60 * 1000;
};

const scheduleEmails = async (sequenceId) => {
  try {
    const sequence = await Sequence.findById(sequenceId);

    if (!sequence) {
      console.log("No sequence found");
      return;
    }

    const leadSourceNode = sequence.nodes.find((n) =>
      n.data?.label?.startsWith("Lead-Source")
    );

    const to = extractEmailFromLeadSource(leadSourceNode);

    if (!to) {
      console.log(
        "No valid email found in Lead-Source node, skipping sequence"
      );
      await Sequence.findByIdAndDelete(sequence._id).catch((err) =>
        console.error("Failed to delete sequence:", err)
      );
      return;
    }
    let totalDelay = 0;
    const scheduledJobs = [];

    for (const node of sequence.nodes) {
      if (!node.data?.label) continue;

      if (node.data.label.startsWith("Cold-Email")) {
        const subject = extractSubjectFromNode(node);
        const text = extractTextFromNode(node);

        totalDelay += 5000;

        scheduledJobs.push(
          agenda.schedule(new Date(Date.now() + totalDelay), "send email", {
            to,
            subject,
            text,
          })
        );
      } else if (node.data.label.startsWith("Wait/Delay")) {
        totalDelay += extractDelayFromNode(node);
      }
    }

    await Promise.all(scheduledJobs);

    await Sequence.findByIdAndDelete(sequence._id);
    console.log(`Scheduled ${scheduledJobs.length} emails for ${to}`);
  } catch (error) {
    console.error("Error in scheduleEmails:", error);
  }
};

export { agenda, scheduleEmails };
