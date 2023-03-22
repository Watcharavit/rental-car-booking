const Provider = require("../models/Provider")

//@desc     GET all providers
//@route    GET /provider
//@access   Public
exports.getAllProvider = async (req, res, next) => {
	try {
		const providers = await Provider.find()
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
//@access   Private
exports.createProvider = async (req, res, next) => {
	try {
		const { name, address, tel } = req.body
		const provider = await Provider.create({ name, address, tel })
		res.status(201).json({
			success: true,
			data: provider
		})
	} catch (err) {
		console.log(err)
		res.status(400).json({ success: false })
	}
}

//@desc     Add pickup and return location
//@route    POST /provider/:id
//@access   Private
exports.addPickupAndReturnLocation = async (req, res, next) => {
	try {
		const { pickUpAndReturnLocation } = req.body
		await Provider.updateOne({ _id: req.params.id }, { $addToSet: { pickUpAndReturnLocation } })
		const provider = await Provider.findById(req.params.id)
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
