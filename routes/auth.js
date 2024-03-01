const express = require("express");

const {
  register,
  login,
  getMe,
  logout,
  deleteMe,
} = require("../controllers/auth");

const router = express.Router();

const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.delete("/deleteMe", protect, deleteMe, logout);

module.exports = router;
