const Provider = require("../models/Provider")

//@desc     GET all providers
//@route    GET /provider
//@access   Public
exports.getAllProvider = async (req, res, next) => {
	try {
		const providers = await Provider.find().populate('rental')
		res.status(200).json({ success: true, count: providers.length, data: providers })
	} catch (err) {
		res.status(400).json({ success: false })
	}
}

//@desc     GET single provider
//@route    GET /provider/:id
//@access   Public
exports.getProvider = async (req, res, next) => {
	try {
		const provider = await Provider.findById(req.params.id)

		if (!provider) {
			return res.status(400).json({ success: false })
		}

		res.status(200).json({ success: true, data: provider })
	} catch (err) {
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
		if (!provider) {
			return res.status(400).json({ success: false, error: "Provider not found" })
		}

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

		if (!provider) {
			return res.status(400).json({ success: false })
		}
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

		if (!provider) {
			return res.status(400).json({
				success: false,
				message: `Provider not found with id of ${req.params.id}`
			})
		}

		provider.remove()
		res.status(200).json({ success: true, data: {} })
	} catch (err) {
		res.status(400).json({ success: false })
	}
}
