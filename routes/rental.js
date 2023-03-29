const express = require("express")
const {
	getAllRentals,
	getRental,
	addRental,
	updateRental,
	deleteRental,
	getAvailableProvider
} = require("../controllers/rental")

const router = express.Router({ mergeParams: true })

const { protect, authorize } = require("../middleware/auth")

router.get("/", protect, getAllRentals)
router.get("/availbleProvider", protect, authorize("admin", "user"), getAvailableProvider)
router.post("/:providerId", protect, authorize("admin", "user"), addRental)
router
	.route("/:id")
	.get(protect, getRental)
	.put(protect, authorize("admin", "user"), updateRental)
	.delete(protect, authorize("admin", "user"), deleteRental)

module.exports = router
