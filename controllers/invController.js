const invModel = require("../models/inventory-model")

const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    
    // Get inventory items by ID
    const data = await invModel.getInventoryByClassificationId(classification_id);

    // Check if data is not empty
    if (data && data.length > 0) {
      // Build  grid
      const grid = await utilities.buildClassificationGrid(data);
      
      // navigation menu
      let nav = await utilities.getNav();
      
      const className = data[0].classification_name;
      
      // Render the classification
      res.render("./inventory/classification", {
          title: `${className} vehicles`,
          nav,
          grid,
      });
    } else {
      let nav = await utilities.getNav();
      // If no inventory items found, render an appropriate message
      res.render("errors/error", {
          title: "Error",
          nav,
          message: "No inventory items found for this classification.",
      });
    }
  } catch (error) {
    next(error); // Pass error
  }
};

// function to show inventory item detail
invCont.showInventoryDetail = async function(req, res, next) {
  try {
    const invId = req.params.invId;
    const vehicle = await invModel.getInventoryItemById(invId);
    if (!vehicle) {
      throw { status: 404, message: "Vehicle not found" };
    }
    const htmlContent = utilities.formatInventoryDetail(vehicle);
    const nav = await utilities.getNav();
    res.render("./inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      htmlContent
    });
  } catch (error) {
    next(error);
  }
};


module.exports = invCont

