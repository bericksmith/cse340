const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const utilities = require("../utilities/");

router.get("/add", utilities.checkLogin, reviewController.addReviewForm);
router.post("/add", utilities.checkLogin, reviewController.addReview);

module.exports = router;