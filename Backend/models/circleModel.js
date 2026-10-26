const { Schema, model, Types } = require("mongoose");

const mySchema = new Schema(
  {
    name: { type: String, require: true },
    description: { type: String, require: true },
    admin: { type: Types.ObjectId, ref: "users" },
    members: { type: Array, default: [] },
  },
  { timestamps: true },
);

module.exports = model("circle", mySchema);
