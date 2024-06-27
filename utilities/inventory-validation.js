const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};

/* *************************
 * Classification Data Validation Rules
 * ************************ */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty()
      .matches(/^[a-zA-Z]+$/)
      .withMessage("Classification name does not meet requirements"),
  ];
};

/* *************************
 * Check data and return errors or continue to add classification
 * ************************ */
validate.checkclassData = async (req, res, next) => {
  const { classification_name } = req.body;
  
  let errors = validationResult(req).array();
  
  if (errors.length > 0) {
    let nav = await utilities.getNav(); // Resolve the promise
    res.render("inventory/add-classification", {
      errors,
      title: "Add Classification",
      nav,
      classification_name,
    });
    return;
  }
  next();
};

/* *************************
 * Inventory Data Validation Rules
 * ************************ */
validate.addInventoryRules = () => {
  return [
    body("classification_id")
      .notEmpty()
      .withMessage("Please provide a classification"),

    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a vehicle make name."),

    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a vehicle model name."),

    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a vehicle description."),
      
    body("inv_image")
      .trim()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a vehicle image path"),

    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a vehicle image thumbnail path"),

    body("inv_price")
      .trim()
      .notEmpty()
      .matches(/^\d+$/)
      .withMessage("Please provide price for the vehicle."),

    body("inv_year")
      .trim()
      .notEmpty()
      .matches(/^\d{4}$/)
      .withMessage("Please provide year for the vehicle."),

    body("inv_miles")
      .trim()
      .notEmpty()
      .matches(/^\d+$/)
      .withMessage("Please provide miles for the vehicle."),

    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a vehicle color"), 

  ];
};

/* *************************
 * Check data and return errors or continue to add inventory
 * ************************ */
validate.checkInvData = async (req, res, next) => {
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;

  let errors = validationResult(req).array(); // Convert validation result to array

  if (errors.length > 0) {
    let nav = await utilities.getNav(); // Resolve the promise
    let classificationList = await utilities.buildClassificationList(classification_id); // Resolve the promise

    res.render("inventory/add-inventory", {
      errors,
      title: "Add Inventory",
      nav,
      classificationList,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    });
    return;
  }
  next();
};

module.exports = validate;
