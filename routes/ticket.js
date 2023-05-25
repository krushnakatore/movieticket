import express from "express";
import {
  analyticsTicketController,
  createTicketController,
  deleteTicketController,
  getAllTicketsController,
  updateTicketController,
} from "../controllers/ticketController.js";
import { authController } from "../middlwares/authenticate.js";

const router = express.Router();

//ticket create route
router.post("/create-ticket", authController, createTicketController);

//get all tickets route
router.get("/get-ticket", authController, getAllTicketsController);

//update any ticket
router.put("/update-ticket/:id", authController, updateTicketController);

//delete a ticket
router.delete("/delete-ticket/:id", authController, deleteTicketController);

//analytics for the movie tickets
router.get("/analytics/visited", authController, analyticsTicketController);

export default router;
