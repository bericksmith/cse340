const path = require('path');
const { validationResult } = require("express-validator");
const reviewModel = require("../models/review-model");
const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

// Function to format date
function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
}

const reviewCont = {};

reviewCont.addReviewForm = async (req, res) => {
  const { inv_id } = req.query;
  const account_id = req.session.accountData ? req.session.accountData.id : null;
  const nav = await utilities.getNav();
  const vehicle = await invModel.getInventoryItemById(inv_id);
  res.render(path.join("reviews", "add-review"), {
    title: "Add Review",
    nav,
    inv_id,
    account_id,
    vehicle,
    errors: [] 
  });
};

reviewCont.addReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const { inv_id, account_id } = req.body;
    const nav = await utilities.getNav();
    const vehicle = await invModel.getInventoryItemById(inv_id);
    return res.render(path.join("reviews", "add-review"), {
      title: "Add Review",
      nav,
      inv_id,
      account_id,
      vehicle,
      errors: errors.array(),
      review_text: req.body.review_text
    });
  }

  const { inv_id, account_id, review_text } = req.body;
  const review_date = new Date();
  try {
    const newReview = await reviewModel.addReview(inv_id, account_id, review_text, review_date);
    req.flash("success", "Review added successfully.");
    res.redirect(`/inv/detail/${inv_id}`);
  } catch (error) {
    req.flash("error", "Failed to add review.");
    res.redirect(`/inv/detail/${inv_id}`);
  }
};

module.exports = reviewCont;
