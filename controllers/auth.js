const User = require("../models/User")

//@desc    Register user
//@route   POST /auth/register
//@param	{
//     			"name": "Admin",
//     			"email": "Admin@gmail.com",
//     			"tel": "0890002222",
//     			"password": "12345678",
//     			"role": "admin"
// 			}
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
//@param	{
//     			"email": "Admin@gmail.com",
//     			"password": "12345678",
// 			}
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
	try {
		const user = await User.findById(req.user.id)
		res.status(200).json({
			success: true,
			data: user
		})
	} catch (err) {
		res.status(400).json({ success: false })
		console.log(err.stack)
	}
}

//@desc		Log out
//@route 	GET /auth/logout
//@access	Public
exports.logout = async (req, res, next) => {
	res.cookie("token", "none", {
		expires: new Date(Date.now() + 10 * 1000),
		httpOnly: true
	})

	res.status(200).json({
		success: true,
		data: {}
	})
}
