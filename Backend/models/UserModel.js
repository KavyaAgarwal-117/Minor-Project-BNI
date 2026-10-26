const { Schema, model } = require("mongoose");

const mySchema = new Schema(
  {
    name: { type: String, require: true },
    email: { type: String, unique: true },
    password: { type: String, require: true },
    city: { type: String, default: "Unknown" },
  },
  { timestamps: true },
);

module.exports = model("users", mySchema);
