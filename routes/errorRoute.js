const express = require("express");
const router = express.Router();
const errorController = require("../controllers/errorController");
// Route for an intentional error
router.get("/start-error", errorController.startError);

module.exports = router;