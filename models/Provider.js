const mongoose = require("mongoose");

const providerSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Please add a name"],
			unique: true,
			trim: true,
			maxlength: [50, "Name can not be moore than 50 characters"],
		},
		address: {
			type: String,
			required: [true, "Please add an address"],
		},
		tel: {
			type: String,
			required: [true, "Please add a phone number"],
		},
		pickUpAndReturnLocation: {
			type: [
				{
					location: { type: String },
				},
			],
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

//Reverse populate with virtuals
providerSchema.virtual("cars", {
	ref: "Car",
	localField: "_id",
	foreignField: "provider",
	justOne: false,
});

//Cascade delete cars when a provider is deleted
providerSchema.pre("remove", async function (next) {
	console.log(`Cars being removed from provider ${this.id}`);
	await this.model("Car").deleteMany({ provider: this._id });
	next();
});

module.exports = mongoose.model("Provider", providerSchema);
