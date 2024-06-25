// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const classValidate = require('../utilities/inventory-validation')
const utilities = require("../utilities/index");


router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:invId", utilities.handleErrors(invController.showInventoryDetail));
router.get("/", utilities.handleErrors(invController.managementView));
router.get("/add-classification", invController.addClassificationView);
router.get("/add-inventory", invController.addInventoryView);

router.post(
    "/add-classification",
    classValidate.checkclassData,
    invController.addClassification
);

router.post(
    "/add-inventory", 
    classValidate.checkInvData,
    invController.addInventory
);

module.exports = router;
