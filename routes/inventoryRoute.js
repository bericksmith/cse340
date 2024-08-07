const classValidate = require('../utilities/inventory-validation')
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/index")

router.get(
    "/type/:classificationId", 
    utilities.handleErrors(invController.buildByClassificationId))

router.get(
    "/detail/:invId", 
    utilities.handleErrors(invController.showInventoryDetail))

router.get(
    "/", 
    utilities.checkLogin, 
    utilities.requireAdminOrEmployee, 
    utilities.handleErrors(invController.managementView))

router.get(
    "/add-classification", 
    utilities.checkLogin, 
    utilities.requireAdminOrEmployee, 
    utilities.handleErrors(invController.addClassificationView))

router.get(
    "/add-inventory", 
    utilities.checkLogin, 
    utilities.requireAdminOrEmployee, 
    utilities.handleErrors(invController.addInventoryView))

router.get(
    "/getInventory/:classification_id", 
    utilities.handleErrors(invController.getInventoryJSON))

router.get(
    '/edit/:inv_id', 
    utilities.checkLogin, 
    utilities.requireAdminOrEmployee, 
    utilities.handleErrors(invController.editInventoryView))

router.post(
    "/add-classification",
    utilities.checkLogin,
    utilities.requireAdminOrEmployee,
    classValidate.classificationRules(),
    classValidate.checkClassData,
    utilities.handleErrors(invController.addClassification)
)

router.post(
    "/add-inventory", 
    utilities.checkLogin,
    utilities.requireAdminOrEmployee,
    classValidate.addInventoryRules(),
    classValidate.checkInvData,
    utilities.handleErrors(invController.addInventory)
)

router.post(
    "/edit-inventory/", 
    utilities.checkLogin, 
    utilities.requireAdminOrEmployee, 
    classValidate.addInventoryRules(), 
    classValidate.checkInvData, 
    utilities.handleErrors(invController.updateInventory))

// Delete confirmation route
router.get(
    "/delete/:inv_id", 
    utilities.checkLogin,
    utilities.requireAdminOrEmployee,
    utilities.handleErrors(invController.buildDeleteConfirm));

// Delete item route
router.post(
    "/delete", 
    utilities.checkLogin,
    utilities.requireAdminOrEmployee,
    utilities.handleErrors(invController.deleteInventoryItem));

module.exports = router

