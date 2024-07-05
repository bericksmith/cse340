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
