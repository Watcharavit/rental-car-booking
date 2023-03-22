const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema({
	rentDate: {
		type: Date,
		required: true,
	},
	user: {
		type: mongoose.Schema.ObjectId,
		ref: "User",
		required: true,
	},
	car: {
		type: mongoose.Schema.ObjectId,
		ref: "Car",
		required: true,
	},
	// may not be needed
	// provider: {
	// 	type: mongoose.Schema.ObjectId,
	// 	ref: "Provider",
	// 	required: true,
	// },
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model("Rental", rentalSchema);
