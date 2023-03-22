const express = require("express")
const { getAllProvider, getProvider, createProvider, updateProvider, deleteProvider, addPickupAndReturnLocation } = require("../controllers/provider")

//Include other resource routers
const appointmentRouter = require("./rental")

const router = express.Router()

const { protect, authorize } = require("../middleware/auth")

//Re-route into other resource routers
router.use("/:hospitalId/rental/", appointmentRouter)

router.route("/").get(getAllProvider).post(protect, authorize("admin"), createProvider)
router.route("/:id").get(getProvider).post(protect, authorize("admin"), addPickupAndReturnLocation).put(protect, authorize("admin"), updateProvider).delete(protect, authorize("admin"), deleteProvider)

module.exports = router
