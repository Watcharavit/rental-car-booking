const mongoose = require("mongoose")

const carSchema = new mongoose.Schema(
	{
		provider: {
			type: mongoose.Schema.ObjectId,
			ref: "Provider",
			required: true
		},
		status: {
			type: Boolean
			// true = avialable
			// false = unavailable
		}
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
)

module.exports = mongoose.model("Car", carSchema)
