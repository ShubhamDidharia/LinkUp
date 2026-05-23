import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import reportRoutes from "./routes/report.routes.js";
import adminRoutes from "./routes/admin.routes.js";

import connectDB from "./db/connectMongo.js";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: process.env.NODE_ENV === "production" ? "" : ["http://localhost:5173", "http://localhost:3000"],
		methods: ["GET", "POST"],
		credentials: true
	}
});

const PORT = process.env.PORT || 8000;

// Store online users
const onlineUsers = new Map(); // userId -> socketId

// Socket.IO connection handler
io.on("connection", (socket) => {
	console.log(`New client connected: ${socket.id}`);

	// When user comes online
	socket.on("user_online", (userId) => {
		onlineUsers.set(userId, socket.id);
		socket.userId = userId;
		console.log(`User ${userId} is online`);
	});

	// Handle disconnect
	socket.on("disconnect", () => {
		if (socket.userId) {
			onlineUsers.delete(socket.userId);
			console.log(`User ${socket.userId} is offline`);
		}
	});
});

// Make io accessible to routes
app.use((req, res, next) => {
	req.io = io;
	req.onlineUsers = onlineUsers;
	next();
});

app.use(express.json({ limit: "5mb" })); // to parse req.body
// limit shouldn't be too high to prevent DOS
app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded)

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);


httpServer.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	connectDB();
});
