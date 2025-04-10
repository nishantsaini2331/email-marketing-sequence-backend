import Sequence from "../models/sequence.model.js";
import { scheduleEmails } from "../services/emailScheduler.js";

async function startProcess(req, res) {
  try {
    const { nodes, edges } = req.body;
    const sequence = new Sequence({ nodes, edges });
    await sequence.save();
    await scheduleEmails(sequence._id);
    res.status(200).json(sequence);
  } catch (error) {
    res.status(500).json({ message: "Error starting process", error });
  }
}

export { startProcess };
