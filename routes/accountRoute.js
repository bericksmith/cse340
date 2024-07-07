const { check } = require('express-validator')
const regValidate = require('../utilities/account-validation')
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/index");

router.get('/login', utilities.handleErrors(accountController.buildLogin));

router.get('/register', utilities.handleErrors(accountController.buildRegister));

router.get('/logout', utilities.handleErrors(accountController.logoutAccount));

router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))

router.get('/logout-success', utilities.handleErrors(async (req, res) => {
  const nav = await utilities.getNav();
  res.render('account/logout', { title: 'Logged Out Successfully', nav });
}));


// Deliver the account update view
router.get('/update/:account_id', accountController.getAccountUpdateView);

// Process account update
router.post('/update/:account_id',  
    [
        check('account_firstname').notEmpty().withMessage('First name is required'),
        check('account_lastname').notEmpty().withMessage('Last name is required'),
        check('account_email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format')
    ], accountController.updateAccountInformation
);

// Process password change
router.post('/change-password/:account_id',
  [
      check('newPassword').notEmpty().withMessage('New password is required').isLength({ min: 12 }).withMessage('Password must be at least 12 characters long'),
  ], accountController.changePassword
);


// Process the registration data
router.post(
    "/register",
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
  )

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)


module.exports = router;
