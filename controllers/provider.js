const Provider = require("../models/Provider")
const { validateProvider } = require("../utils/utils")

//@desc     GET all providers
//@route    GET /provider
//@access   Private
exports.getAllProvider = async (req, res, next) => {
	try {
		let providers
		// Admin can see rentals belong to provider
		if (req.user.role === "admin") {
			providers = await Provider.find().populate("rental")
		} else {
			// User cannot see some fields
			providers = await Provider.find({}, { carBookings: 0, rentalCarCapacity: 0, createdAt: 0 })
		}
		res.status(200).json({ success: true, count: providers.length, data: providers })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false })
	}
}

//@desc     GET single provider
//@route    GET /provider/:id
//@access   Private
exports.getProvider = async (req, res, next) => {
	try {
		let provider
		// Admin can see rentals belong to provider
		if (req.user.role === "admin") {
			provider = await Provider.findById(req.params.id).populate("rental")
		} else {
			// User cannot see some fields
			provider = await Provider.findById(req.params.id, { carBookings: 0, rentalCarCapacity: 0, createdAt: 0 })
		}

		let error = validateProvider(provider, req.params.id, res)
		if (error) return error
		res.status(200).json({ success: true, data: provider })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false })
	}
}

//@desc     Create provider
//@route    POST /provider
//@param	{
//     			"name": "Home Car",
//     			"address": "Bangkok",
//     			"tel": "0992225555",
//     			"rentalCarCapacity": 12
// 			}
//@access   Private
exports.createProvider = async (req, res, next) => {
	try {
		const { name, address, tel, rentalCarCapacity } = req.body
		const provider = await Provider.create({ name, address, tel, rentalCarCapacity })
		res.status(201).json({
			success: true,
			data: provider
		})
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false })
	}
}

//@desc     GET pickup and return locations with provider id
//@route    GET /provider/location
//@access   Private
exports.getPickupAndReturnLocation = async (req, res, next) => {
	try {
		let provider = await Provider.aggregate([
			{ $unwind: "$pickUpAndReturnLocations" },
			{ $group: { _id: "$pickUpAndReturnLocations", providers: { $addToSet: "$_id" } } },
			{ $project: { pickUpAndReturnLocations: "$_id", _id: 0, providers: 1 } },
			{ $sort: { pickUpAndReturnLocations: 1 } }
		])

		res.status(200).json({ success: true, data: provider })
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false })
	}
}

//@desc     Add pickup and return locations
//@route    POST /provider/:id
//@param	{
// 				"pickUpAndReturnLocation": ["Bangkok", "Phuket", "Chiang Mai"]
// 			}
//@access   Private
exports.addPickupAndReturnLocation = async (req, res, next) => {
	try {
		const { pickUpAndReturnLocation } = req.body
		const provider = await Provider.findByIdAndUpdate(
			req.params.id,
			{ $addToSet: { pickUpAndReturnLocations: { $each: pickUpAndReturnLocation } } },
			{ new: true }
		)
		let error = validateProvider(provider, req.params.id, res)
		if (error) return error

		res.status(201).json({
			success: true,
			data: provider
		})
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false })
	}
}

//@desc     Update provider
//@route    PUT /provider/:id
//@param	{
//     			"name"?: "Home Car",
//     			"address"?: "Bangkok",
//     			"tel"?: "0992225555",
//     			"rentalCarCapacity"?: 12,
//				"pickUpAndReturnLocation"?: ["Bangkok", "Phuket", "Chiang Mai"],
//				"carBookings"?: [{
//                    "date": "2025-02-16T00:00:00.000Z",
//                    "amount": 1,
//                    "_id": "641ded2f0636c2712dc7dd05"
//               }]
// 			}
//@access   Private
exports.updateProvider = async (req, res, next) => {
	try {
		const provider = await Provider.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		})

		let error = validateProvider(provider, req.params.id, res)
		if (error) return error

		res.status(200).json({ success: true, data: provider })
	} catch (err) {
		res.status(400).json({ success: false })
	}
}

//@desc     Delete provider
//@route    DELETE /provider/:id
//@access   Private
exports.deleteProvider = async (req, res, next) => {
	try {
		const provider = await Provider.findById(req.params.id)

		let error = validateProvider(provider, req.params.id, res)
		if (error) return error

		provider.remove()
		res.status(200).json({ success: true, data: {} })
	} catch (err) {
		res.status(400).json({ success: false })
	}
}
