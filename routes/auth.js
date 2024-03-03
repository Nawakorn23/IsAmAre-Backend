const express = require("express");

const {
  register,
  login,
  getMe,
  logout,
  updateMe,
  deleteAccount,
  getAllUsers,
} = require("../controllers/auth");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", protect, getMe);
router.put("/updateMe", protect, updateMe);
router.get("/getallusers", protect, authorize("admin"), getAllUsers);
router.route("/:id").delete(protect, authorize("admin"), deleteAccount, logout);

module.exports = router;
