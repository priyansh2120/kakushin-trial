import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";

export const signup = async (req, res) => {
	try {
		const { name, username, password, confirmPassword, gender, age, profession, income } = req.body;

		// Check if passwords match
		if (password !== confirmPassword) {
			return res.status(400).json({ error: "Passwords don't match" });
		}

		// Check if username already exists
		const existingUser = await User.findOne({ username });
		if (existingUser) {
			return res.status(400).json({ error: "Username already exists" });
		}

		// Hash the password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Generate profile picture URL based on gender
		const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
		const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

		// Create new user
		const newUser = new User({
			name,
			username,
			password: hashedPassword,
			gender,
			profilePictureUrl: gender === "male" ? boyProfilePic : girlProfilePic,
			age,
			profession,
			income,
			country: null,
			state: null,
			city: null,
			virtualCurrency: 0,
			financialLiteracy: 0,
			badge: [],
			phoneNumber: null,
			role: 'User',
			financialGoals: null,
			educationLevel: null,
			address: null,
			lastLogin: null
		});

		// Save the new user and generate token
		await newUser.save();
		generateTokenAndSetCookie(newUser._id, res);

		// Send response
		res.status(201).json({
			_id: newUser._id,
			name: newUser.name,
			username: newUser.username,
			profilePictureUrl: newUser.profilePictureUrl,
		});
	} catch (error) {
		console.log("Error in signup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const login = async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({ username });
		const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

		if (!user || !isPasswordCorrect) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		generateTokenAndSetCookie(user._id, res);

		res.status(200).json({
			_id: user._id,
			name: user.name,
			username: user.username,
			profilePic: user.profilePic,
		});
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const logout = (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const updateUser = async (req, res) => {
	try {
		const { userId } = req.params;
		const user = await User.findById(userId);
		const updatedData = req.body;
		try {
			const updatedUser = await User.findOneAndUpdate(
				{ username: username },
				{ $set: updatedData },
				{ new: true }
			);
	
			if (!updatedUser) {
				return res.status(404).send('User not found');
			}
	
			res.send(updatedUser);
		} catch (error) {
			res.status(500).send(error.message);
		}
	}
	catch (error) {
		res.status(500).json({ error: error.message });
	}
}
