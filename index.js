import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import ticketRoutes from "./routes/ticket.js";
import connectDB from "./config/db.js";

//initialising express
const app = express();
//configuring the env folder
dotenv.config();

//connectiong to mongoDB database
(async () => await connectDB())();

//middleware
app.use(cors());
app.use(express.json());

//routes
app.use("/api/v1", ticketRoutes);

//port
const PORT = process.env.PORT || 9000;

app.listen(PORT, (req, res) => {
  console.log("listening on port", PORT);
});
