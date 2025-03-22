import mongoose, { Schema } from "mongoose";
const ReportSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: "users" },
  doctorId: { type: Schema.Types.ObjectId, ref: "doctors" },
  image: { type: String },
});
const ReportModel =
  mongoose.models.ReportSchema || mongoose.model("report", ReportSchema);

export default ReportModel;
