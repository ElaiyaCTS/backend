import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
});

const DbConnection = mongoose.connection;

// Error Event
DbConnection.on("error", (error) => {
  console.log(`Error: connecting to Mongoose database ${error}`);
});

// Success Event
DbConnection.once("open", () => {
  console.log("Database connected successfully"); // ✅ This will print now
});

export default DbConnection;
