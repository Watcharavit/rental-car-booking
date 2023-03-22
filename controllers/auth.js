const User = require("../models/User")

//@desc    Register user
//@route   POST /auth/register
//@access  Public
exports.register = async (req, res, next) => {
	try {
		const { name, email, password, tel, role } = req.body

		//Create user
		const user = await User.create({
			name,
			email,
			password,
			tel,
			role
		})

		sendTokenResponse(user, 200, res)
	} catch (err) {
		res.status(400).json({ success: false })
		console.log(err.stack)
	}
}

//@desc		Login user
//@route	POST /auth/login
//@access	Public
exports.login = async (req, res, next) => {
	const { email, password } = req.body

	//Validate email & password
	if (!email || !password) {
		return res.status(400).json({ success: false, msg: "Please provide an email and password" })
	}

	//Check for user
	const user = await User.findOne({ email }).select("+password")

	if (!user) {
		return res.status(400).json({ success: false, msg: "Invalid credentials" })
	}

	//Check if password matches
	const isMatch = await user.matchPassword(password)

	if (!isMatch) {
		return res.status(401).json({ success: false, msg: "Invalid credentials" })
	}

	sendTokenResponse(user, 200, res)
}

//Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
	//Create token
	const token = user.getSignedJwtToken()

	const options = {
		expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
		httpOnly: true
	}

	if (process.env.NODE_ENV === "production") {
		options.secure = true
	}
	res.status(statusCode).cookie("token", token, options).json({ success: true, token })
}

//@desc		Get current Logged in user
//@route 	POST /auth/me
//@access	Private
exports.getMe = async (req, res, next) => {
	const user = await User.findById(req.user.id)
	res.status(200).json({
		success: true,
		data: user
	})
}

//@desc		Log out
//@route 	POST /auth/logout
//@access	Private
exports.logout = async (req, res, next) => {
	const cookies = req.cookies
	try {
		const user = await User.findOne({ refreshToken: cookies.jwt })
		if (!user) return res.status(401).json({ message: "Not found user" })

		user.refreshToken = undefined
		await user.save()

		res.clearCookie("jwt", {
			path: "/",
			httpOnly: true,
			secure: process.env.NODE_ENV === "production"
		})
		res.clearCookie("refreshToken")
		res.send("Logged out successfully")
	} catch (error) {
		res.status(400).send({ message: error.message })
	}
}
