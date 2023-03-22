const mongoose = require("mongoose")

const rentalSchema = new mongoose.Schema({
	pickUpDate: {
		type: Date,
		required: true
	},
	returnDate: {
		type: Date,
		required: true
	},
	pickUpLocation: {
		type: String,
		required: true
	},
	returnLocation: {
		type: String,
		required: true
	},
	user: {
		type: mongoose.Schema.ObjectId,
		ref: "User",
		required: true
	},
	provider: {
		type: mongoose.Schema.ObjectId,
		ref: "Provider",
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
})

module.exports = mongoose.model("Rental", rentalSchema)
