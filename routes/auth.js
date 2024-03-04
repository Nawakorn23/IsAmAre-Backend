const express = require("express");

const {
  register,
  login,
  getMe,
  logout,
  updateMe,
  getAllUsers,
  deleteMe
} = require("../controllers/auth");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", protect, getMe);
router.put("/updateMe", protect, updateMe);
router.get("/getallusers", protect, authorize("admin"), getAllUsers);
router.delete("/deleteMe", protect, deleteMe);

module.exports = router;
