import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (userId, res) => {
	const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: "15d",
	});

	res.cookie("jwt", token, {
		maxAge: 15 * 24 * 60 * 60 * 1000, // MS
		httpOnly: true,
		// Lax avoids cookie issues when frontend is 127.0.0.1 and API is localhost (or vice versa).
		sameSite: process.env.NODE_ENV === "development" ? "lax" : "strict",
		secure: process.env.NODE_ENV !== "development",
	});
};

export default generateTokenAndSetCookie;