const Rental = require("../models/Rental")
const Provider = require("../models/Provider")

//@desc     Get all rental
//@route    GET /rental
//@access   Public
exports.getAllRentals = async (req, res, next) => {
	let query
	//General users can see only thair rental!
	if (req.user.role !== "admin") {
		query = Rental.find({ user: req.user.id }).populate({
			path: "provider",
			select: "name"
		})
	} else {
		//If you are an admin, you can see all!
		query = Rental.find().populate({
			path: "provider",
			select: "name"
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

// //@desc     Get single rental
// //@route    GET /rental/:id
// //@access   Public
// exports.getRental = async (req, res, next) => {
// 	try {
// 		const rental = await Rental.findById(req.params.id).populate({
// 			path: "car",
// 			select: "provider status"
// 		})
// 		if (!rental) {
// 			return res.status(404).json({
// 				success: false,
// 				message: `No rental with the id of ${req.params.id}`
// 			})
// 		}

// 		res.status(200).json({
// 			success: true,
// 			data: rental
// 		})
// 	} catch (error) {
// 		console.log(error)
// 		return res.status(500).json({ success: false, message: "Cannot find rental" })
// 	}
// }

//@desc     Add rental
//@route    POST /rental
//@access   Private
exports.addRental = async (req, res, next) => {
	try {
		const { pickUpDate, returnDate, pickUpLocation, returnLocation, provider } = req.body
		const providerDoc = await Provider.findById(provider)

		if (!providerDoc) {
			return res.status(404).json({ success: false, message: `No provider with the id of ${req.params.provider}` })
		}

		if (!(providerDoc.pickUpAndReturnLocation.includes(pickUpLocation) && providerDoc.pickUpAndReturnLocation.includes(returnLocation))) {
			return res.status(400).json({ success: false, message: `Pick up or return location not availble` })
		}

		if (new Date(pickUpDate).getTime() > new Date(returnDate).getTime()) {
			return res.status(400).json({ success: false, message: `Invalid pick up and return date` })
		}

		//check if from pickUpDate to returnDate have rentalCarAmount-bookedCarAmount > 0
		const availableToBook =
			providerDoc.bookedCarAmount.every((book) => {
				if (new Date(pickUpDate).getTime() <= book.date && book.date <= new Date(returnDate).getTime()) {
					return providerDoc.rentalCarAmount - book.amount > 0
				} else return true
			}) && providerDoc.rentalCarAmount > 0

		if (!availableToBook) {
			return res.status(400).json({ success: false, message: `Car is not available in specific date` })
		}
		//update bookedCarAmount from pickUpDate to returnDate amount by 1

		//add user and provider Id to req.body
		req.body.user = req.user.id

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

// //@desc     Update rental
// //@route    PUT /rental/:id
// //@access   Private
// exports.updateRental = async (req, res, next) => {
// 	try {
// 		let rental = await Rental.findById(req.params.id)

// 		if (!rental) {
// 			return res.status(404).json({
// 				success: false,
// 				message: `No rental with the id of ${req.params.id}`
// 			})
// 		}

// 		//Make sure user is the rental user
// 		if (rental.user.toString() !== req.user.id && req.user.role !== "admin") {
// 			return res.status(401).json({
// 				success: false,
// 				menubar: `User ${req.user.id} is not authorized to update this rental`
// 			})
// 		}

// 		rental = await Rental.findByIdAndUpdate(req.params.id, req.body, {
// 			new: true,
// 			runValidators: true
// 		})

// 		res.status(200).json({
// 			success: true,
// 			data: rental
// 		})
// 	} catch (error) {
// 		console.log(error)
// 		return res.status(500).json({ success: false, message: "Cannot update this rental" })
// 	}
// }

// //@desc     Delete appointment
// //@route    DELETE /rental/:id
// //@access   Private
// exports.deleteRental = async (req, res, next) => {
// 	try {
// 		let rental = await Rental.findById(req.params.id)

// 		if (!rental) {
// 			return res.status(404).json({
// 				success: false,
// 				message: `No rental with the id of ${req.params.id}`
// 			})
// 		}

// 		//Make sure user is the rental owner
// 		if (rental.user.toString() !== req.user.id && req.user.role !== "admin") {
// 			return res.status(401).json({
// 				success: false,
// 				menubar: `User ${req.user.id} is not authorized to delete this rental`
// 			})
// 		}

// 		rental = await Rental.remove()

// 		res.status(200).json({
// 			success: true,
// 			data: {}
// 		})
// 	} catch (error) {
// 		console.log(error)
// 		return res.status(500).json({ success: false, message: "Cannot delete this rental" })
// 	}
// }
