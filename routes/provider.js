const express = require("express")
const {
	getAllProvider,
	getProvider,
	createProvider,
	updateProvider,
	deleteProvider,
	addPickupAndReturnLocation,
	getPickupAndReturnLocation
} = require("../controllers/provider")

const router = express.Router()

const { protect, authorize } = require("../middleware/auth")

router.route("/").get(protect, getAllProvider).post(protect, authorize("admin"), createProvider)
router.route("/location").get(protect, getPickupAndReturnLocation)
router
	.route("/:id")
	.get(protect, getProvider)
	.post(protect, authorize("admin"), addPickupAndReturnLocation)
	.put(protect, authorize("admin"), updateProvider)
	.delete(protect, authorize("admin"), deleteProvider)
module.exports = router
