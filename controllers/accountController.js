const { validationResult } = require('express-validator');
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
}

/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildAccountManagement(req, res, next) {
  try {
      let nav = await utilities.getNav();
      const accountData = req.session.accountData;
      const flashMessage = req.flash("message");
      let messages = [];
      if (flashMessage.length > 0) {
          messages.push({ type: "success", text: flashMessage[0] });
      }
        res.render("account/account-management", {
            title: "Account Management",
            account_type: accountData.accountType,
            account_firstname: accountData.firstName,
            account_id: accountData.id,
            messages: messages,
            nav,
            errors: null,
        });
  } catch (error) {
      next(error);
  }
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { 
    account_firstname, 
    account_lastname, 
    account_email, 
    account_password 
  } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}

/* ****************************************
*  Process Login
* *************************************** */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }

  try {
    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password)
    if (passwordMatch) {
      const { account_firstname } = accountData
      delete accountData.account_password
      const payload = {
        id: accountData.account_id,
        accountType: accountData.account_type,
        firstName: accountData.account_firstname,
        lastName: accountData.account_lastname,
        email: accountData.account_email,
      }
      const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      req.session.loggedIn = true
      req.session.accountData = payload
      return res.redirect("/account/")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    console.error('Login error:', error)
    req.flash("notice", "An error occurred during login. Please try again later.")
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }
}

/* ****************************************
*  update account view
* *************************************** */

async function getAccountUpdateView(req, res) {
  try {
      let nav = await utilities.getNav();
      const account_id = req.params.account_id;
      const account = await accountModel.getAccountById(account_id);
      const flashMessage = req.flash("message");
      let messages = [];
      if (flashMessage.length > 0) {
          messages.push({ type: "success", text: flashMessage[0] })
      };;

      if (!account) {
          return res.status(404).send('Account not found');
      }
      res.render('account/update', { 
          title: 'Edit Account', 
          nav,
          account,
          messages: messages,
          errors: null
      });
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
};


/* ****************************************
*  update account information
* *************************************** */
async function updateAccountInformation(req, res) {
  try {
      let nav = await utilities.getNav();
      const errors = validationResult(req);
      const account_id = req.params.account_id;
      if (!errors.isEmpty()) {
          const account = await accountModel.getAccountById(account_id);
          const flashMessage = req.flash("message");
      let messages = [];
      if (flashMessage.length > 0) {
          messages.push({ type: "success", text: flashMessage[0] })
      };
          return res.render('account/update', { 
              title: 'Update Account Information', 
              nav,
              messages,
              account, 
              errors: errors.array() 
          });
      }
      
      const { account_firstname, account_lastname, account_email } = req.body;
      const updatedAccount = await accountModel.updateAccountInformation(account_id, account_firstname, account_lastname, account_email);
      
      // Update session data
      req.session.accountData.firstName = updatedAccount.account_firstname;
      req.session.accountData.lastName = updatedAccount.account_lastname;
      req.session.accountData.email = updatedAccount.account_email;

      req.flash('message', 'Congratulations, your account information has been updated.');
      res.redirect('/account'); // Redirect to management view
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
};


/* ****************************************
*  Change password
* *************************************** */
async function changePassword(req, res) {
  try { 
      let nav = await utilities.getNav();
      const errors = validationResult(req);
      const account_id = req.params.account_id;
      const account = await accountModel.getAccountById(account_id);
      if (!errors.isEmpty()) {
          const flashMessage = req.flash("message");
          let messages = [];
          if (flashMessage.length > 0) {
              messages.push({ type: "success", text: flashMessage[0] });
          }
          return res.render('account/update', { 
              title: 'Update Account Information', 
              nav,
              messages,
              account, 
              errors: errors.array() 
          });
      }
      
      const { currentPassword, newPassword } = req.body;

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await accountModel.updatePassword(account_id, hashedPassword);
      
      req.flash('message', 'Password changed successfully');
      res.redirect('/account'); // Redirect to management view
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
};

/* ****************************************
*  Process Logout
* *************************************** */
async function logoutAccount(req, res, next) {
  try {
    res.clearCookie("jwt");
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return next(err);
      }
      res.redirect("/account/logout-success");
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, getAccountUpdateView, updateAccountInformation, changePassword, logoutAccount }
