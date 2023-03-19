const mongoose = require('mongoose')

const HospitalSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Please add a name'],
			unique: true,
			trim: true,
			maxlength: [50, 'Name can not be moore than 50 characters']
		},
		address: {
			type: String,
			required: [true, 'Please add an address']
		},
		district: {
			type: String,
			required: [true, 'Please add a district']
		},
		province: {
			type: String,
			required: [true, 'Please add a province']
		},
		postalcode: {
			type: String,
			required: [true, 'Please add a postalcode'],
			maxlength: [5, 'Postal Code can not be more than 5 digits']
		},
		tel: {
			type: String
		},
		region: {
			type: String,
			required: [true, 'Please add a region']
		}
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
)

//Reverse populate with virtuals
HospitalSchema.virtual('appointments', {
	ref: 'Appointment',
	localField: '_id',
	foreignField: 'hospital',
	justOne: false
})

//Cascade delete appointments when a hospital is deleted
HospitalSchema.pre('remove', async function (next) {
	console.log(`Appointments being removed from hospital ${this.id}`)
	await this.model('Appointment').deleteMany({ hospital: this._id })
	next()
})

module.exports = mongoose.model('Hospital', HospitalSchema)
