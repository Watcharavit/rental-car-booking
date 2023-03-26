const mongoose = require("mongoose")

const rentalSchema = new mongoose.Schema({
	pickUpDate: {
		type: Date,
		required: [true, "Please add a pickUpDate"]
	},
	returnDate: {
		type: Date,
		required: [true, "Please add a returnDate"]
	},
	pickUpLocation: {
		type: String,
		required: [true, "Please add a pickUpLocation"]
	},
	returnLocation: {
		type: String,
		required: [true, "Please add a returnLocation"]
	},
	user: {
		type: mongoose.Schema.ObjectId,
		ref: "User",
		required: [true, "Please add a user"]
	},
	provider: {
		type: mongoose.Schema.ObjectId,
		ref: "Provider",
		required: [true, "Please add a provider"]
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
})

module.exports = mongoose.model("Rental", rentalSchema)
