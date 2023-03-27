const express = require("express")
const {
	getAllProvider,
	getProvider,
	createProvider,
	updateProvider,
	deleteProvider,
	addPickupAndReturnLocation
} = require("../controllers/provider")

const router = express.Router()

const { protect, authorize } = require("../middleware/auth")

router.route("/").get(protect, getAllProvider).post(protect, authorize("admin"), createProvider)
router
	.route("/:id")
	.get(protect, getProvider)
	.post(protect, authorize("admin"), addPickupAndReturnLocation)
	.put(protect, authorize("admin"), updateProvider)
	.delete(protect, authorize("admin"), deleteProvider)

module.exports = router
