const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const utilities = require("../utilities/");

router.get("/add", 
    utilities.checkLogin, 
    utilities.handleErrors(reviewController.addReviewForm));

router.post(
  "/add",
  utilities.checkLogin,
  [
    body("review_text")
    .trim()
    .notEmpty()
    .withMessage("Review text cannot be empty."),
  ],
  utilities.handleErrors(reviewController.addReview)
);

module.exports = router;