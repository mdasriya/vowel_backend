const express = require("express");
const router = express.Router()

const { updateUserDetails, getUserDetails, signUp, login, auth } = require("../controlers/User");

router.post("/signup", signUp);
router.post("/login", login);
router.post("/updateUserDetails", auth, updateUserDetails);
router.get("/getUserDetails", auth, getUserDetails);

module.exports = router