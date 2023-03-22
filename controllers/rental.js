const Rental = require("../models/Rental")
const Provider = require("../models/Provider")
const Car = require("../models/Car")

//@desc     Get all appointments
//@route    GET /rental/allRentals
//@access   Public
exports.getAllRentals = async (req, res, next) => {
	let query
	//General users can see only thair rental!
	if (req.user.role !== "admin") {
		query = Rental.find({ user: req.user.id })
			.populate({
				path: "car",
				select: "provider status"
			})
			.populate({
				path: "car.provider",
				select: "name address tel"
			})
	} else {
		//If you are an admin, you can see all!
		query = Rental.find()
			.populate({
				path: "car",
				select: "provider status"
			})
			.populate({
				path: "car.provider",
				select: "name address tel"
			})
			.populate({
				path: "user",
				select: "name email tel"
			})
	}
	try {
		const allRentals = await query
		res.status(200).json({
			success: true,
			count: allRentals.length,
			data: allRentals
		})
	} catch (error) {
		console.log(error)
		return res.status(500).json({ success: false, message: "Cannot find rentals" })
	}
}

//@desc     Get single rental
//@route    GET /rental/:id
//@access   Public
exports.getRental = async (req, res, next) => {
	try {
		const rental = await Rental.findById(req.params.id).populate({
			path: "car",
			select: "provider status"
		})
		if (!rental) {
			return res.status(404).json({
				success: false,
				message: `No rental with the id of ${req.params.id}`
			})
		}

		res.status(200).json({
			success: true,
			data: rental
		})
	} catch (error) {
		console.log(error)
		return res.status(500).json({ success: false, message: "Cannot find rental" })
	}
}

//@desc     Add rental
//@route    POST /rental/:carID
//@access   Private
exports.addRental = async (req, res, next) => {
	try {
		const car = await Car.findById(req.params.carID)

		if (!car) {
			return res.status(404).json({
				success: false,
				message: `No car with the id of ${req.params.carID}`
			})
		}

		if (!car.status) {
			return res.status(400).json({
				success: false,
				message: `The car with the id of ${req.params.carID} is not available`
			})
		}

		//Check for existed rental
		const existedRental = await Rental.find({ user: req.user.id })

		//If the user is not an admin, they can only crete 3 rental.
		if (existedRental.length >= 3 && req.user.role != "admin") {
			return res.status(400).json({
				success: false,
				message: `The user with ID ${req.user.id} has already made 3 rental`
			})
		}

		req.body.car = req.params.carID
		req.body.user = req.user.id

		const rental = await Rental.create(req.body)

		res.status(200).json({
			success: true,
			data: rental
		})
	} catch (error) {
		console.log(error)
		return res.status(500).json({ success: false, message: "Cannot create this rental" })
	}
}

//@desc     Update rental
//@route    PUT /rental/:id
//@access   Private
exports.updateRental = async (req, res, next) => {
	try {
		let rental = await Rental.findById(req.params.id)

		if (!rental) {
			return res.status(404).json({
				success: false,
				message: `No rental with the id of ${req.params.id}`
			})
		}

		//Make sure user is the rental user
		if (rental.user.toString() !== req.user.id && req.user.role !== "admin") {
			return res.status(401).json({
				success: false,
				menubar: `User ${req.user.id} is not authorized to update this rental`
			})
		}

		rental = await Rental.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		})

		res.status(200).json({
			success: true,
			data: rental
		})
	} catch (error) {
		console.log(error)
		return res.status(500).json({ success: false, message: "Cannot update this rental" })
	}
}

//@desc     Delete appointment
//@route    DELETE /rental/:id
//@access   Private
exports.deleteRental = async (req, res, next) => {
	try {
		let rental = await Rental.findById(req.params.id)

		if (!rental) {
			return res.status(404).json({
				success: false,
				message: `No rental with the id of ${req.params.id}`
			})
		}

		//Make sure user is the rental owner
		if (rental.user.toString() !== req.user.id && req.user.role !== "admin") {
			return res.status(401).json({
				success: false,
				menubar: `User ${req.user.id} is not authorized to delete this rental`
			})
		}

		rental = await Rental.remove()

		res.status(200).json({
			success: true,
			data: {}
		})
	} catch (error) {
		console.log(error)
		return res.status(500).json({ success: false, message: "Cannot delete this rental" })
	}
}
