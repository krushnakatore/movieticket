import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  creationDate: { type: Date, default: Date.now },
  customerName: { type: String, required: true },
  movieTitle: { type: String, required: true },
  movieTime: { type: String, required: true },
  ticketPrice: { type: Number, required: true },
});

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
