const mongoose = require('mongoose');

const mongoUri = "mongodb+srv://mdshakib:vihar2025@cluster0.wnybzpn.mongodb.net/inotebook?retryWrites=true&w=majority&appName=Cluster0";

const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log("✅ Successfully connected to MongoDB!");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);

    // Optional: Don't crash immediately, retry after a few seconds
    // console.log("Retrying connection in 5 seconds...");
    // setTimeout(connectToMongo, 5000);

    // Or exit if you want strict failure handling
    process.exit(1);
  }
};

// Listen for Mongoose connection errors after initial connect
mongoose.connection.on('error', err => {
  console.error("❌ MongoDB connection error:", err);
});

// Listen for disconnection
mongoose.connection.on('disconnected', () => {
  console.warn("⚠️ MongoDB disconnected. Trying to reconnect...");
  // Optional: auto-reconnect logic can be added here
});

module.exports = connectToMongo;
