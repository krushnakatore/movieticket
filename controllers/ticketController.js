import { getMonthName, months } from "../constants/constants.js";
import Ticket from "../models/ticketModel.js";

export const createTicketController = async (req, res) => {
  const { creationDate, customerName, movieTitle, movieTime, ticketPrice } =
    req.body;
  try {
    const ticket = new Ticket({
      creationDate,
      customerName,
      movieTitle,
      movieTime,
      ticketPrice,
    });
    const newTicket = await ticket.save();

    res.status(201).send({
      success: true,
      message: "Ticket Generated Successfully",
      newTicket,
    });
  } catch (err) {
    return res.status(400).send({ success: false, error: err.message });
  }
};

// Read all tickets
export const getAllTicketsController = async (req, res) => {
  try {
    const ticket = await Ticket.find({});

    res.status(200).send({
      success: true,
      message: "Ticket fetched Successfully",
      ticket,
    });
  } catch (err) {
    return res.status(400).send({ success: false, error: err.message });
  }
};

// Update a ticket
export const updateTicketController = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerName, movieTitle, movieTime, ticketPrice } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      id,
      {
        customerName,
        movieTitle,
        movieTime,
        ticketPrice,
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Ticket Updated Successfully",
      ticket,
    });
  } catch (err) {
    return res.status(400).send({ success: false, error: err.message });
  }
};

// Delete a ticket
export const deleteTicketController = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByIdAndDelete(id);
    res
      .status(400)
      .send({ success: true, message: "Ticket Deleted Successfully", ticket });
  } catch (err) {
    return res.status(400).send({ success: false, error: err.message });
  }
};

export const analyticsTicketController = async (req, res) => {
  const { method } = req.query;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  if (method === "db-aggregation") {
    try {
      Ticket.aggregate([
        {
          // matching the data for selected dates
          $match: {
            creationDate: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
          },
        },
        {
          //making group for it for each movie by adding the ticket price and visited User
          $group: {
            _id: {
              movie: "$movieTitle",
              month: { $month: "$creationDate" },
            },
            summaryProfit: { $sum: "$ticketPrice" },
            summaryVisits: { $sum: 1 },
          },
        },
        {
          // Again making group according to month for each movie
          $group: {
            _id: "$_id.movie",
            monthlyEarnings: {
              $push: {
                month: {
                  $let: {
                    vars: {
                      months: months,
                    },
                    in: {
                      $arrayElemAt: ["$$months", "$_id.month"],
                    },
                  },
                },
                summaryProfit: "$summaryProfit",
                summaryVisits: "$summaryVisits",
              },
            },
          },
        },
        {
          //projecting the required data according to the moviname and price and visits
          $project: {
            _id: 0,
            movie: "$_id",
            earningsByMonth: "$monthlyEarnings",
            visitsByMonth: "$monthlyEarnings",
          },
        },
      ])
        .then((result) => {
          const formattedResult = result.reduce(
            (acc, { movie, earningsByMonth }) => {
              const monthlySummaries = earningsByMonth.map(
                // adding each total of the price and visits
                ({ month, summaryProfit, summaryVisits }) => ({
                  month,
                  summaryProfit,
                  summaryVisits,
                })
              );
              acc.push({ movie, monthlySummaries });
              return acc;
            },
            []
          );
          res.json(formattedResult);
        })
        .catch((err) => res.status(400).json({ error: err.message }));
    } catch (err) {
      return res.status(400).send({ success: false, error: err.message });
    }
  } else {
    try {
      const tickets = await Ticket.find({});

      const filteredTickets = tickets.filter(
        (ticket) =>
          ticket.creationDate >= new Date(startDate) &&
          ticket.creationDate <= new Date(endDate)
      );

      // Group tickets by movie and month
      const groupedTickets = filteredTickets.reduce((groups, ticket) => {
        const movie = ticket.movieTitle;
        const month = ticket.creationDate.getMonth() + 1; // Adding 1 since getMonth() returns zero-based month index

        if (!groups[movie]) {
          groups[movie] = {};
        }

        if (!groups[movie][month]) {
          groups[movie][month] = {
            month: getMonthName(month),
            summaryProfit: 0,
            summaryVisits: 0,
          };
        }

        groups[movie][month].summaryProfit += ticket.ticketPrice;
        groups[movie][month].summaryVisits += 1;

        return groups;
      }, {});

      // Generate the final result array
      const formattedResult = Object.entries(groupedTickets).map(
        ([movie, months]) => {
          const monthlySummaries = Object.values(months);

          return { movie, monthlySummaries };
        }
      );

      res.status(200).json(formattedResult);
    } catch (err) {
      return res.status(400).send({ success: false, error: err.message });
    }
  }
};
