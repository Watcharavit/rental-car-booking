const {
	getAddedCarBookings,
	validateAvailabilityToBook,
	validatePickUpAndReturnDate,
	validatePickUpAndReturnLocations,
	validateProvider,
	validateRental,
	getDeletedCarBookings
} = require("../utils/utils")

const Rental = require("../models/Rental")
const Provider = require("../models/Provider")

//@desc     Get all rental
//@route    GET /rental
//@access   Public
exports.getAllRentals = async (req, res, next) => {
	let query
	//General users can see only thair rental!
	if (req.user.role !== "admin") {
		query = Rental.find({ user: req.user.id })
			.populate({
				path: "provider",
				select: "name address tel"
			})
			.populate({
				path: "user",
				select: "name email tel"
			})
	} else {
		//If you are an admin, you can see all!
		query = Rental.find()
			.populate({
				path: "provider",
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
		const rental = await Rental.findById(req.params.id)
			.populate({
				path: "provider",
				select: "name address tel"
			})
			.populate({
				path: "user",
				select: "name email tel"
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
//@route    POST /rental/:providerId
//@param	{
//    			"pickUpDate":"2023-05-20",
//   			"returnDate":"2023-05-23",
//   			"pickUpLocation":"Bangkok",
//   			"returnLocation":"Phuket"
//			}
//@access   Private
exports.addRental = async (req, res, next) => {
	try {
		const { pickUpLocation, returnLocation } = req.body
		const pickUpDate = new Date(req.body.pickUpDate)
		const returnDate = new Date(req.body.returnDate)

		const provider = await Provider.findById(req.params.providerId)

		let error =
			validateProvider(provider, req.params.providerId, res) ??
			validatePickUpAndReturnLocations(provider, pickUpLocation, returnLocation, res) ??
			validatePickUpAndReturnDate(pickUpDate, returnDate, res) ??
			validateAvailabilityToBook(provider.carBookings, provider.rentalCarCapacity, pickUpDate, returnDate, res)
		if (error) return error
		
		//Check for existed rental
		const existedRental = await Rental.find({ user: req.user.id })

		//If the user is not an admin, they can only create 3 rental.
		if (existedRental.length >= 3 && req.user.role != "admin") {
			return res.status(400).json({
				success: false,
				message: `The user with ID ${req.user.id} has already made 3 rental`
			})
		}

		//add user and provider Id to req.body
		req.body.user = req.user.id
		req.body.provider = req.params.providerId
		const rental = await Rental.create(req.body)

		await Provider.findByIdAndUpdate(req.params.providerId, {
			carBookings: getAddedCarBookings(provider, pickUpDate, returnDate)
		})

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
//@param	{
//    			"pickUpDate"?:"2023-05-20",
//   			"returnDate"?:"2023-05-23",
//   			"pickUpLocation"?:"Bangkok",
//   			"returnLocation"?:"Phuket"
//			}
//@access   Private
exports.updateRental = async (req, res, next) => {
	try {
		let { pickUpLocation, returnLocation, provider } = req.body
		let pickUpDate = req.body.pickUpDate ? new Date(req.body.pickUpDate) : null
		let returnDate = req.body.returnDate ? new Date(req.body.returnDate) : null

		let rental = await Rental.findById(req.params.id)
		let error = validateRental(rental, req, res)
		if (error) return error

		//assign to current value if null
		pickUpLocation ??= rental.pickUpLocation
		returnLocation ??= rental.returnLocation
		pickUpDate ??= rental.pickUpDate
		returnDate ??= rental.returnDate
		provider ??= rental.provider

		const isSameProvider = provider.toString() === rental.provider.toString()

		//Make sure user is the rental user
		if (rental.user.toString() !== req.user.id && req.user.role !== "admin") {
			return res.status(401).json({
				success: false,
				menubar: `User ${req.user.id} is not authorized to update this rental`
			})
		}

		const currentProvider = await Provider.findById(rental.provider) // current provider
		const newProvider = await Provider.findById(provider) //new provider

		error =
			validateProvider(newProvider, provider, res) ??
			validatePickUpAndReturnLocations(newProvider, pickUpLocation, returnLocation, res) ??
			validatePickUpAndReturnDate(pickUpDate, returnDate, res)
		if (error) return error

		const deletedCarBookings = getDeletedCarBookings(rental, currentProvider)

		error = validateAvailabilityToBook(
			isSameProvider ? deletedCarBookings : getDeletedCarBookings(rental, newProvider),
			newProvider.rentalCarCapacity,
			pickUpDate,
			returnDate,
			res
		)
		if (error) return error

		// delete car bookings from old provider
		const updatedOldProvider = await Provider.findByIdAndUpdate(
			rental.provider,
			{
				carBookings: deletedCarBookings
			},
			{ new: true }
		)

		// add car bookings to new provider
		const updatedNewProvider = await Provider.findByIdAndUpdate(
			provider,
			{
				carBookings: getAddedCarBookings(
					isSameProvider ? updatedOldProvider : newProvider,
					pickUpDate,
					returnDate
				)
			},
			{ new: true }
		)

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

//@desc     Delete rental
//@route    DELETE /rental/:id
//@access   Private
exports.deleteRental = async (req, res, next) => {
	try {
		const rental = await Rental.findOneAndDelete({ _id: req.params.id })
		let error = validateRental(rental, req, res)
		if (error) return error

		//Make sure user is the rental owner
		if (rental.user.toString() !== req.user.id && req.user.role !== "admin") {
			return res.status(401).json({
				success: false,
				menubar: `User ${req.user.id} is not authorized to delete this rental`
			})
		}

		const provider = await Provider.findById(rental.provider._id)

		await Provider.findByIdAndUpdate(rental.provider, {
			carBookings: getDeletedCarBookings(rental, provider)
		})

		res.status(200).json({
			success: true,
			data: {}
		})
	} catch (error) {
		console.log(error)
		return res.status(500).json({ success: false, message: "Cannot delete this rental" })
	}
}
