import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log("MongDB connected to" + conn.connection.host);
  } catch (err) {
    console.log("Error connecting to MongoDB Due to error: " + err);
  }
};

export default connectDB;
