// Needed Resources 
const classValidate = require('../utilities/inventory-validation')
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/index");

router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:invId", utilities.handleErrors(invController.showInventoryDetail));
router.get("/", utilities.handleErrors(invController.managementView));
router.get("/add-classification", invController.addClassificationView);
router.get("/add-inventory", invController.addInventoryView);

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

router.get('/edit/:inv_id', utilities.handleErrors(invController.editInventoryView));

router.post(
    "/add-classification",
    classValidate.classificationRules(),
    classValidate.checkClassData,
    utilities.handleErrors(invController.addClassification)
);

router.post(
    "/add-inventory", 
    classValidate.addInventoryRules(),
    classValidate.checkInvData,
    utilities.handleErrors(invController.addInventory)
);

module.exports = router;
