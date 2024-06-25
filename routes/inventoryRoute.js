// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/index");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to display inventory item detail
router.get("/detail/:invId", utilities.handleErrors(invController.showInventoryDetail));

// Route to display management view
router.get("/", utilities.handleErrors(invController.managementView));

// Route to render the add classification view
router.get("/add-classification", invController.addClassificationView);

// Route to handle adding a new classification
router.post("/add-classification", invController.addClassification);

// Route to render the add inventory view
router.get("/add-inventory", invController.addInventoryView);

// Route to handle adding a new vehicle
router.post("/add-inventory", invController.addInventory);

module.exports = router;
