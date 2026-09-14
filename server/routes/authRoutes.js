const express = require("express");
const router = express.Router()

const {signup, login, logout} = require("./../controllers/authController")
const {verifyToken} = require("../middleware/auth")

// http://localhost:3000/api/auth
router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", verifyToken, logout)

module.exports = router
