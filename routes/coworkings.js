const express = require("express");
const {
  getCoworkings,
  getCoworking,
  createCoworking,
  updateCoworking,
  deleteCoworking,
} = require("../controllers/coworkings");

//Include other resource routers
const appointmentRouter = require("./appointments");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

//Re-route into other resource routers
router.use("/:coworkingId/appointments/", appointmentRouter);

router
  .route("/")
  .get(getCoworkings)
  .post(protect, authorize("admin"), createCoworking);
router
  .route("/:id")
  .get(getCoworking)
  .put(protect, authorize("admin"), updateCoworking)
  .delete(protect, authorize("admin"), deleteCoworking);

module.exports = router;
