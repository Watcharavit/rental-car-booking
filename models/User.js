const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please add a name"]
	},
	email: {
		type: String,
		required: [true, "Please add an email"],
		unique: true,
		match: [
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
			"Please add a valid email"
		]
	},
	role: {
		type: String,
		enum: ["user", "admin"],
		defalut: "user"
	},
	password: {
		type: String,
		required: [true, "Please add a password"],
		minlength: 6,
		select: false
	},
	tel: {
		type: String,
		require: [true, "Please add a phone number"],
		maxlength: 10
	},
	resetPasswordToken: String,
	resetPasswordExpire: Date,
	createdAt: {
		type: Date,
		default: Date.now
	}
})

//Encrypt password using bcrypt
userSchema.pre("save", async function (next) {
	const salt = await bcrypt.genSalt(10)
	this.password = await bcrypt.hash(this.password, salt)
})

//Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE
	})
}

//Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password)
}

module.exports = mongoose.model("User", userSchema)
