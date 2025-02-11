const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const voterSchema = new mongoose.Schema({
  // voterAddress: { type: String, required: true },
  name: { type: String, required: true },
  aadhar: { type: String, required: true, unique: true },
  constituency: { type: Number, required: true },
  hasVoted: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  voterId: { type: Number, unique: true },
});

// Apply the auto-increment plugin to the voterId field
voterSchema.plugin(AutoIncrement, { inc_field: "voterId" });

module.exports = mongoose.model("Voter", voterSchema);
