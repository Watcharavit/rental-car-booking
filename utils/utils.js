const getDatesInRange = (startDate, endDate) => {
	const dates = []
	let currentDate = new Date(startDate)

	while (currentDate <= endDate) {
		dates.push(new Date(currentDate))
		currentDate.setDate(currentDate.getDate() + 1)
	}
	return dates
}

exports.validateProvider = (provider, req, res) => {
	if (!provider) {
		return res.status(404).json({ success: false, message: `No provider with the id of ${req.params.providerId}` })
	}
}

exports.validateRental = (rental, req, res) => {
	if (!rental) {
		return res.status(404).json({
			success: false,
			message: `No rental with the id of ${req.params.id}`
		})
	}
}

exports.validatePickUpAndReturnLocations = (provider, pickUpLocation, returnLocation, res) => {
	if (!provider.pickUpAndReturnLocations.includes(pickUpLocation)) {
		return res.status(400).json({ success: false, message: `Pick up location not availble` })
	}
	if (!provider.pickUpAndReturnLocations.includes(returnLocation)) {
		return res.status(400).json({ success: false, message: `Return location not availble` })
	}
}

exports.validatePickUpAndReturnDate = (pickUpDate, returnDate, res) => {
	if (pickUpDate.getTime() > returnDate.getTime()) {
		return res.status(400).json({ success: false, message: `Invalid pick up and return date` })
	}

	// check if pickUpDate & returnDate is in the future
	if (pickUpDate.getTime() < Date.now() || returnDate.getTime() < Date.now()) {
		return res.status(400).json({ success: false, message: `Pick up date and return date should be in the future` })
	}
}

exports.validateAvailabilityToBook = (provider, pickUpDate, returnDate, res) => {
	// check if from pickUpDate to returnDate have rentalCarCapacity-carBookings > 0
	const availableToBook =
		provider.carBookings.every((book) => {
			if (pickUpDate.getTime() <= book.date.getTime() && book.date.getTime() <= returnDate.getTime()) {
				return provider.rentalCarCapacity - book.amount > 0
			} else return true
		}) && provider.rentalCarCapacity > 0

	if (!availableToBook) {
		return res.status(400).json({ success: false, message: `Car is not available in specific date` })
	}
}

exports.getAddedCarBookings = (provider, pickUpDate, returnDate) => {
	let AddedCarBookings = provider.carBookings

	// increase carBookings from pickUpDate to returnDate amount by 1
	getDatesInRange(pickUpDate, returnDate).map((date) => {
		let index = AddedCarBookings.findIndex((book) => book.date.getTime() === date.getTime())
		if (index !== -1) {
			AddedCarBookings[index].amount++
		} else {
			AddedCarBookings.push({ date: date, amount: 1 })
		}
	})
	return AddedCarBookings
}

exports.getDeletedCarBookings = (rental, provider) => {
	let carBookings = provider.carBookings
	// decrease carBookings from pickUpDate to returnDate amount by 1
	carBookings.forEach((book) => {
		const bookDate = new Date(book.date)
		if (rental.pickUpDate.getTime() <= bookDate.getTime() && bookDate.getTime() <= rental.returnDate.getTime()) {
			book.amount--
		}
	})

	// remove book with amount = 0
	return carBookings.filter((book) => book.amount > 0)
}
