const path = require('path');
const reviewModel = require("../models/review-model");
const invModel = require("../models/inventory-model"); 
const utilities = require("../utilities/");

const reviewCont = {};

reviewCont.addReviewForm = async (req, res) => {
  const { inv_id } = req.query;
  const account_id = req.session.accountData ? req.session.accountData.id : null;
  const nav = await utilities.getNav();
  const vehicle = await invModel.getInventoryItemById(inv_id);
  res.render(path.join("reviews", "add-review"), { title: "Add Review", nav, inv_id, account_id, vehicle });
};

reviewCont.addReview = async (req, res) => {
  const { inv_id, account_id, review_text } = req.body;
  const review_date = new Date();
  try {
    const newReview = await reviewModel.addReview(inv_id, account_id, review_text, review_date);
    res.redirect(`/inv/detail/${inv_id}`);
  } catch (error) {
    res.redirect(`/inv/detail/${inv_id}`);
  }
};

module.exports = reviewCont;
