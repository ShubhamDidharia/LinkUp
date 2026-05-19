import mongoose from "mongoose";
import Post from "../models/post.model.js";
import dotenv from "dotenv";

dotenv.config();

async function migratePosts() {
  try {
    console.log("Starting migration: Adding isNsfw field to existing posts...");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✓ Connected to MongoDB");

    // Update all posts without isNsfw field to have isNsfw: false
    const result = await Post.updateMany(
      { isNsfw: { $exists: false } },
      { $set: { isNsfw: false } }
    );

    console.log(`✓ Migration completed successfully!`);
    console.log(`  - Matched documents: ${result.matchedCount}`);
    console.log(`  - Modified documents: ${result.modifiedCount}`);

    // Close connection
    await mongoose.connection.close();
    console.log("✓ MongoDB connection closed");
  } catch (error) {
    console.error("✗ Migration failed:", error.message);
    process.exit(1);
  }
}

// Run migration
migratePosts();
