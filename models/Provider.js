const mongoose = require("mongoose")

const providerSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Please add a name"],
			unique: true,
			trim: true,
			maxlength: [50, "Name can not be more than 50 characters"]
		},
		address: {
			type: String,
			required: [true, "Please add an address"]
		},
		tel: {
			type: String,
			required: [true, "Please add a phone number"]
		},
		pickUpAndReturnLocations: [String],
		rentalCarCapacity: {
			type: Number,
			required: [true, "Please add rental car amount"]
		},
		carBookings: [
			{
				date: Date,
				amount: Number
			}
		],
		createdAt: {
			type: Date,
			default: Date.now
		}
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
)

//Reverse populate with virtual
providerSchema.virtual("rental", {
	ref: "Rental",
	localField: "_id",
	foreignField: "provider",
	justOne: false
})

//Cascade delete rentals when a provider is deleted
providerSchema.pre("remove", async function (next) {
	console.log(`Rentals being removed from provider ${this.id}`)
	await this.model("Rental").deleteMany({ provider: this._id })
	next()
})

module.exports = mongoose.model("Provider", providerSchema)
