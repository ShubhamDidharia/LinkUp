import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/user.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const createAdmin = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("MONGO_URI is not defined in environment variables");
            process.exit(1);
        }

        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB successfully");

        const existingAdmin = await User.findOne({ 
            $or: [{ username: "admin123" }, { email: "admin@gmail.com" }] 
        });

        if (existingAdmin) {
            console.log("Admin user already exists. Setting role to 'admin' just in case.");
            existingAdmin.role = "admin";
            await existingAdmin.save();
            console.log("Admin role updated successfully.");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash("admin@123", 10);

        const admin = new User({
            fullName: "System Admin",
            username: "admin123",
            email: "admin@gmail.com",
            password: hashedPassword,
            role: "admin",
            status: "active"
        });

        await admin.save();
        console.log("Admin user created successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error creating admin user:", error);
        process.exit(1);
    }
};

createAdmin();
