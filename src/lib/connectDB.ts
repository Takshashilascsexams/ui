import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const { connection } = await mongoose.connect(
      process.env.MONGO_URI as string
    );
    if (connection.readyState === 1) {
      return Promise.resolve(true);
    }
    console.log("Connected to database.");
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};
