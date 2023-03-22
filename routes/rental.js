const express = require("express")
const { getAllRentals, getRental, addRental, updateRental, deleteRental } = require("../controllers/rental")

const router = express.Router({ mergeParams: true })

const { protect, authorize } = require("../middleware/auth")

router.get("/", protect, getAllRentals)
router.post("/:CarId", protect, authorize("admin", "user"), addRental)
router
	.route("/:id")
	.get(protect, getRental)
	.put(protect, authorize("admin", "user"), updateRental)
	.delete(protect, authorize("admin", "user"), deleteRental)

module.exports = router
