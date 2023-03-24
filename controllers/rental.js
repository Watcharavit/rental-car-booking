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

function getDatesInRange(startDate, endDate) {
	const dates = []
	let currentDate = new Date(startDate)

	while (currentDate <= endDate) {
		dates.push(new Date(currentDate))
		currentDate.setDate(currentDate.getDate() + 1)
	}
	return dates
}

//@desc     Add rental
//@route    POST /rental
//@param	{
//    			"pickUpDate":"2023-05-20",
//   			"returnDate":"2023-05-23",
//   			"pickUpLocation":"Bangkok",
//   			"returnLocation":"Phuket",
//				"provider": "641d992a1aa285443ad6cb54"
//			}
//@access   Private
exports.addRental = async (req, res, next) => {
	try {
		const { pickUpDate, returnDate, pickUpLocation, returnLocation, provider } = req.body
		const providerDoc = await Provider.findById(provider)

		if (!providerDoc) {
			return res
				.status(404)
				.json({ success: false, message: `No provider with the id of ${req.params.provider}` })
		}

		if (
			!(
				providerDoc.pickUpAndReturnLocations.includes(pickUpLocation) &&
				providerDoc.pickUpAndReturnLocations.includes(returnLocation)
			)
		) {
			return res.status(400).json({ success: false, message: `Pick up or return location not availble` })
		}

		if (new Date(pickUpDate).getTime() > new Date(returnDate).getTime()) {
			return res.status(400).json({ success: false, message: `Invalid pick up and return date` })
		}

		//check if from pickUpDate to returnDate have rentalCarCapacity-carBookings > 0
		const availableToBook =
			providerDoc.carBookings.every((book) => {
				if (
					new Date(pickUpDate).getTime() <= book.date.getTime() &&
					book.date.getTime() <= new Date(returnDate).getTime()
				) {
					return providerDoc.rentalCarCapacity - book.amount > 0
				} else return true
			}) && providerDoc.rentalCarCapacity > 0

		if (!availableToBook) {
			return res.status(400).json({ success: false, message: `Car is not available in specific date` })
		}

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

		req.body.user = req.user.id

		const rental = await Rental.create(req.body)

		let newCarBookings = providerDoc.carBookings

		// increase carBookings from pickUpDate to returnDate amount by 1
		getDatesInRange(new Date(pickUpDate), new Date(returnDate)).map((date) => {
			let index = newCarBookings.findIndex((book) => new Date(book.date).getTime() === date.getTime())
			if (index !== -1) {
				newCarBookings[index].amount++
			} else {
				newCarBookings.push({ date: date, amount: 1 })
			}
		})
		await Provider.findByIdAndUpdate(provider, {
			carBookings: newCarBookings
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
//@access   Private
exports.updateRental = async (req, res, next) => {
	try {
		let { pickUpDate, returnDate, pickUpLocation, returnLocation, provider } = req.body
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

		const currentProviderDoc = await Provider.findById(rental.provider) // current provider
		let newProviderDoc // Update to this provider
		if (provider) {
			//update provider
			newProviderDoc = await Provider.findById(provider)
			if (!newProviderDoc) {
				return res
					.status(404)
					.json({ success: false, message: `No provider with the id of ${req.params.provider}` })
			}
		} else {
			newProviderDoc = await Provider.findById(rental.provider)
		}

		if (pickUpLocation) {
			//update pickUpLocation
			if (!newProviderDoc.pickUpAndReturnLocations.includes(pickUpLocation)) {
				return res.status(400).json({ success: false, message: `Pick up location not availble` })
			}
		}

		if (returnLocation) {
			//update returnLocation
			if (!newProviderDoc.pickUpAndReturnLocations.includes(returnLocation)) {
				return res.status(400).json({ success: false, message: `Return location not availble` })
			}
		}

		if (pickUpDate || returnDate || provider) {
			//update pickUpDate or returnDate or provider
			if (!pickUpDate) {
				//use old pickUpDate
				pickUpDate = rental.pickUpDate
			}
			if (!returnDate) {
				//use old returnDate
				returnDate = rental.returnDate
			}

			pickUpDate = new Date(pickUpDate)
			returnDate = new Date(returnDate)
			let currentCarBookings = currentProviderDoc.carBookings
			const newCarBookings = newProviderDoc.carBookings
			console.log("CCBBB", currentCarBookings)
			console.log("00", newCarBookings)
			console.log("SS", provider, rental.provider.toString())
			if (!provider || provider === rental.provider.toString()) {
				//same provider
				console.log("Same provider")
				// decrease carBookings from pickUpDate to returnDate amount by 1
				currentCarBookings.forEach((book) => {
					const bookDate = new Date(book.date)
					if (pickUpDate.getTime() <= bookDate.getTime() && bookDate.getTime() <= returnDate.getTime()) {
						book.amount--
					}
				})

				//check if from pickUpDate to returnDate have rentalCarCapacity-carBookings > 0
				const availableToBook =
					currentCarBookings.every((book) => {
						if (
							pickUpDate.getTime() <= book.date.getTime() &&
							book.date.getTime() <= returnDate.getTime()
						) {
							return currentProviderDoc.rentalCarCapacity - book.amount > 0
						} else return true
					}) && currentProviderDoc.rentalCarCapacity > 0

				if (!availableToBook) {
					return res.status(400).json({ success: false, message: `Car is not available in specific date` })
				}

				// increase carBookings from pickUpDate to returnDate amount by 1
				getDatesInRange(pickUpDate, returnDate).map((date) => {
					let index = currentCarBookings.findIndex((book) => new Date(book.date).getTime() === date.getTime())
					if (index !== -1) {
						currentCarBookings[index].amount++
					} else {
						newCarBookings.push({ date: date, amount: 1 })
					}
					currentCarBookings
				})
				await Provider.findByIdAndUpdate(rental.provider, {
					carBookings: currentCarBookings
				})
			} else {
				// update to new provider
				// decrease carBookings from pickUpDate to returnDate amount by 1
				console.log("EEE", currentProviderDoc.carBookings)
				console.log("CC1", currentCarBookings)
				currentCarBookings.forEach((book) => {
					const bookDate = new Date(book.date)
					if (pickUpDate.getTime() <= bookDate.getTime() && bookDate.getTime() <= returnDate.getTime()) {
						book.amount--
					}
				})
				// remove book with amount = 0
				currentCarBookings = currentCarBookings.filter((book) => book.amount > 0)
				console.log("CC2", currentCarBookings)
				await Provider.findByIdAndUpdate(rental.provider, {
					carBookings: currentCarBookings
				})

				//check if from pickUpDate to returnDate have rentalCarCapacity-carBookings > 0
				const availableToBook =
					newCarBookings.every((book) => {
						console.log(book.date.getTime())
						if (
							pickUpDate.getTime() <= book.date.getTime() &&
							book.date.getTime() <= returnDate.getTime()
						) {
							return newProviderDoc.rentalCarCapacity - book.amount > 0
						} else return true
					}) && newProviderDoc.rentalCarCapacity > 0

				if (!availableToBook) {
					return res.status(400).json({ success: false, message: `Car is not available in specific date` })
				}

				console.log("2", newProviderDoc)
				// increase carBookings from pickUpDate to returnDate amount by 1
				getDatesInRange(pickUpDate, returnDate).map((date) => {
					let index = newCarBookings.findIndex((book) => new Date(book.date).getTime() === date.getTime())
					if (index !== -1) {
						newCarBookings[index].amount++
					} else {
						newCarBookings.push({ date: date, amount: 1 })
					}
				})

				console.log("3", newProviderDoc)
				await Provider.findByIdAndUpdate(provider, {
					carBookings: newCarBookings
				})
			}
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

//@desc     Delete rental
//@route    DELETE /rental/:id
//@access   Private
exports.deleteRental = async (req, res, next) => {
	try {
		const rental = await Rental.findOneAndDelete({ _id: req.params.id })

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

		const provider = await Provider.findById(rental.provider._id)
		const carBookings = provider.carBookings

		// decrease carBookings from pickUpDate to returnDate amount by 1
		const pickUpDate = new Date(rental.pickUpDate)
		const returnDate = new Date(rental.returnDate)
		carBookings.forEach((book) => {
			const bookDate = new Date(book.date)
			if (pickUpDate.getTime() <= bookDate.getTime() && bookDate.getTime() <= returnDate.getTime()) {
				book.amount--
			}
		})

		// remove book with amount = 0
		const newCarBookings = carBookings.filter((book) => book.amount > 0)

		await Provider.findByIdAndUpdate(rental.provider, {
			carBookings: newCarBookings
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
