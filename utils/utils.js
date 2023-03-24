const getDatesInRange = (startDate, endDate) => {
	const dates = []
	let currentDate = new Date(startDate)

	while (currentDate <= endDate) {
		dates.push(new Date(currentDate))
		currentDate.setDate(currentDate.getDate() + 1)
	}
	return dates
}

exports.validateProvider = (provider, providerId, res) => {
	if (!provider) {
		return res.status(404).json({ success: false, message: `No provider with the id of ${providerId}` })
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
	if (isNaN(pickUpDate.getTime()) || isNaN(returnDate.getTime())) {
		return res.status(400).json({ success: false, message: "Please add pick up and return date " })
	}
	if (pickUpDate.getTime() > returnDate.getTime()) {
		return res.status(400).json({ success: false, message: `Invalid pick up and return date` })
	}

	// check if pickUpDate & returnDate is in the future
	if (pickUpDate.getTime() < Date.now() || returnDate.getTime() < Date.now()) {
		return res.status(400).json({ success: false, message: `Pick up date and return date should be in the future` })
	}
}

exports.validateAvailabilityToBook = (carBookings, rentalCarCapacity, pickUpDate, returnDate, res) => {
	// check if from pickUpDate to returnDate have rentalCarCapacity-carBookings > 0
	const availableToBook =
		carBookings.every((book) => {
			const bookDate = new Date(book.date)
			if (pickUpDate.getTime() <= bookDate.getTime() && bookDate.getTime() <= returnDate.getTime()) {
				return rentalCarCapacity - book.amount > 0
			} else return true
		}) && rentalCarCapacity > 0

	if (!availableToBook) {
		return res.status(400).json({ success: false, message: `Car is not available in specific date` })
	}
}

exports.getAddedCarBookings = (provider, pickUpDate, returnDate) => {
	let AddedCarBookings = JSON.parse(JSON.stringify(provider.carBookings)) // copy array

	// increase carBookings from pickUpDate to returnDate amount by 1
	getDatesInRange(pickUpDate, returnDate).map((date) => {
		let index = AddedCarBookings.findIndex((book) => new Date(book.date).getTime() === date.getTime())
		if (index !== -1) {
			AddedCarBookings[index].amount++
		} else {
			AddedCarBookings.push({ date: date, amount: 1 })
		}
	})
	return AddedCarBookings
}

exports.getDeletedCarBookings = (rental, provider) => {
	let carBookings = JSON.parse(JSON.stringify(provider.carBookings)) // copy array
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
