const express = require("express");
const router = express.Router();
const userController = require("../userController");

router.get("/users/me", userController.getMe);
router.put("/users/me", userController.updateMe);

module.exports = router;
