const invModel = require("../models/inventory-model");
const reviewModel = require("../models/review-model");
const utilities = require("../utilities/");
const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;

    // Get inventory items by ID
    const data = await invModel.getInventoryByClassificationId(
      classification_id
    );

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
        message:
          "<p>No inventory items found for this classification. Please select from the menu above.</p>",
      });
    }
  } catch (error) {
    next(error); // Pass error
  }
};

// function to show inventory item detail
invCont.showInventoryDetail = async function (req, res, next) {
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
      htmlContent,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Build management view
 * ************************** */
invCont.managementView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    // Check if there's any flash message
    const flashMessage = req.flash("message");
    let messages = [];
    if (flashMessage.length > 0) {
      messages.push({ type: "success", text: flashMessage[0] });
    }
    const classificationList = await utilities.buildClassificationList();
    res.render("./inventory/management", {
      title: "Inventory Management",
      messages: messages, // Pass flash messages to the view
      nav,
      classificationList: classificationList,
    });
  } catch (error) {
    next(error); // Pass error to error handling middleware
  }
};

/* ***************************
 *  Build add classifications view
 * ************************** */
invCont.addClassificationView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const flashMessage = req.flash("message");
    let messages = [];
    if (flashMessage.length > 0) {
      messages.push({ type: "success", text: flashMessage[0] });
    }
    res.render("./inventory/add-classification", {
      title: "Add New Classification",
      messages: messages,
      nav,
      errors: [],
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 * adding a new classification
 * ************************** */
invCont.addClassification = async function (req, res) {
  try {
    const { classification_name } = req.body;

    // Server-side validation
    if (
      !classification_name ||
      classification_name.includes(" ") ||
      /[^a-zA-Z0-9]/.test(classification_name)
    ) {
      req.flash(
        "message",
        "Classification name cannot contain spaces or special characters."
      );
      return res.redirect("/inv/add-classification");
    }

    // Insert new classification into the database
    await invModel.addClassification(classification_name);

    // Flash success message
    req.flash("message", "New classification added successfully.");

    // Redirect to the management view
    return res.redirect("/inv");
  } catch (error) {
    req.flash("error", "Failed to add new classification.");
    return res.redirect("/inv/add-classification");
  }
};

/* ***************************
 *  Build add to inventory view
 * ************************** */
invCont.addInventoryView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const flashMessage = req.flash("message");
    const errors = req.flash("error");
    const messages = flashMessage.map((message) => ({
      type: "success",
      text: message,
    }));
    const classificationList = await utilities.buildClassificationList();
    const { classification_id } = req.body;

    res.render("./inventory/add-inventory", {
      title: "Add New Vehicle",
      messages: messages,
      nav,
      errors: errors,
      classificationList: classificationList,
      classification_id: classification_id || "",
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  add to inventory
 * ************************** */
invCont.addInventory = async function (req, res) {
  try {
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
    } = req.body;

    // Insert inventory item into the database
    await invModel.addInventory(
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
    );

    // Flash success message
    req.flash("message", "New inventory item added successfully.");

    // Redirect to the management view
    return res.redirect("/inv");
  } catch (error) {
    console.error("Error adding inventory:", error);
    req.flash("error", "Failed to add new inventory item.");
    return res.redirect("/inv/add-inventory");
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(
    classification_id
  );
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  const itemData = await invModel.getInventoryItemById(inv_id);
  const classificationSelect = await utilities.buildClassificationList(
    itemData.classification_id
  );
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
  });
};

// Function to format date
function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
}

// function to show inventory item detail
invCont.showInventoryDetail = async function (req, res, next) {
  try {
    const invId = req.params.invId;
    const vehicle = await invModel.getInventoryItemById(invId);
    if (!vehicle) {
      throw { status: 404, message: "Vehicle not found" };
    }
    const htmlContent = utilities.formatInventoryDetail(vehicle);
    const nav = await utilities.getNav();

    // Fetch reviews for the inventory item
    const reviews = await reviewModel.getReviewsByInventoryId(invId);
    // Format the review dates and include the user's name
    const formattedReviews = reviews.map(review => ({
      ...review,
      review_date: formatDate(review.review_date),
      reviewer_name: `${review.account_firstname} ${review.account_lastname}`
    }));

    res.render("./inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      htmlContent,
      vehicle, // Pass the vehicle object to the view
      reviews: formattedReviews, // Pass formatted reviews to the view
      account_id: req.session.accountData ? req.session.accountData.id : null // Pass account ID to the view if logged in
    });
  } catch (error) {
    next(error);
  }
};

// Function to build delete confirmation view
invCont.buildDeleteConfirm = async function (req, res, next) {
  try {
    const invId = req.params.inv_id;
    const vehicle = await invModel.getInventoryItemById(invId);
    if (!vehicle) {
      throw { status: 404, message: "Vehicle not found" };
    }
    const nav = await utilities.getNav();
    res.render("./inventory/delete-confirm", {
      title: `Delete ${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};

// Function to delete inventory item
invCont.deleteInventoryItem = async function (req, res, next) {
  try {
    const invId = parseInt(req.body.inv_id);
    const deleteResult = await invModel.deleteInventoryItem(invId);
    if (deleteResult.rowCount > 0) {
      req.flash("message", "Inventory item deleted successfully.");
      res.redirect("/inv");
    } else {
      req.flash("error", "Failed to delete inventory item.");
      res.redirect(`/inv/delete/${invId}`);
    }
  } catch (error) {
    next(error);
  }
};


module.exports = invCont;
