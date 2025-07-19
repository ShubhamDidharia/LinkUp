import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js';

export const signup = async (req, res) => {
	try {
		const { fullName, username, email, password } = req.body;

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

		// Check for existing username and email
		const [existingUser, existingEmail] = await Promise.all([
			User.findOne({ username }),
			User.findOne({ email }),
		]);

		if (existingUser) {
			return res.status(400).json({ error: "Username is already taken" });
		}
		if (existingEmail) {
			return res.status(400).json({ error: "Email is already taken" });
		}

		if (!password || password.length < 6) {
			return res.status(400).json({ error: "Password must be at least 6 characters long" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const newUser = await User.create({
			fullName,
			username,
			email,
			password: hashedPassword,
		});

		generateTokenAndSetCookie(newUser._id, res);

		res.status(201).json({
			_id: newUser._id,
			fullName: newUser.fullName,
			username: newUser.username,
			email: newUser.email,
			followers: newUser.followers,
			following: newUser.following,
			profileImg: newUser.profileImg,
			coverImg: newUser.coverImg,
		});
	} catch (error) {
		console.error("Error in signup:", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const login = async (req, res) => {
	try {
		const { username, password } = req.body;

		const user = await User.findOne({ username });
		if (!user) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		const isPasswordCorrect = await bcrypt.compare(password, user.password);
		if (!isPasswordCorrect) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		generateTokenAndSetCookie(user._id, res);

		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			username: user.username,
			email: user.email,
			followers: user.followers,
			following: user.following,
			profileImg: user.profileImg,
			coverImg: user.coverImg,
		});
	} catch (error) {
		console.error("Error in login:", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const logout = async (req, res) => {
	try {
		res.cookie("jwt", "", { httpOnly: true, maxAge: 0 });
		res.status(200).json({ message: "Logout successful" });
	} catch (error) {
		console.error("Error logging out:", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const getMe = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("-password");
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}
		res.status(200).json(user);
	} catch (error) {
		console.error("Error getting user info:", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
