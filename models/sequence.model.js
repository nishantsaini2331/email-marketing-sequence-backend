import mongoose, { Schema } from "mongoose";

const nodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  position: {
    x: Number,
    y: Number,
  },
  data: {
    label: String,
  },
});

const edgeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  source: { type: String, required: true },
  target: { type: String, required: true },
});

const sequenceSchema = new Schema(
  {
    nodes: [nodeSchema],
    edges: [edgeSchema],
  },
  {
    timestamps: true,
  }
);
const Sequence = mongoose.model("Sequence", sequenceSchema);
export default Sequence;
