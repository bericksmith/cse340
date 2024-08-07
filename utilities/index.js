const jwt = require("jsonwebtoken");
require("dotenv").config();
const invModel = require("../models/inventory-model");
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' image - on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += "<hr />";
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};
/* **************************************
 * Vehicle details into HTML
 * ************************************ */
Util.formatInventoryDetail = function (vehicle) {
  let htmlContent = `<h1>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h1>`;
  htmlContent += `<div class='vehicle-detail'>`;
  htmlContent += `<img src="${vehicle.inv_image}" alt="${vehicle.inv_make} ${vehicle.inv_model} image on CSE Motors" class="center">`;
  htmlContent += `<div class='details'>`;
  htmlContent += `<h2 class="center">${vehicle.inv_make} ${vehicle.inv_model} Details</h2>`;
  htmlContent += `<p class="odd"><strong>Price:</strong> $${new Intl.NumberFormat(
    "en-US",
    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  ).format(vehicle.inv_price)}</p>`;
  htmlContent += `<p class="even"><strong>Description:</strong> ${vehicle.inv_description}</p>`;
  htmlContent += `<p class="odd"><strong>Color:</strong> ${vehicle.inv_color}</p>`;
  htmlContent += `<p class="even"><strong>Miles:</strong> ${new Intl.NumberFormat(
    "en-US"
  ).format(vehicle.inv_miles)}</p>`;
  htmlContent += `<p class="odd"><strong>Year:</strong> ${vehicle.inv_year}</p>`;
  htmlContent += `</div>`;
  htmlContent += `</div>`;
  return htmlContent;
};

Util.buildClassificationList = async function (classification_id = null) {
  try {
    let data = await invModel.getClassifications();
    let classificationList =
      '<select name="classification_id" id="classificationList" required>';
    classificationList += "<option value=''>Choose a Classification</option>";
    data.rows.forEach((row) => {
      classificationList += '<option value="' + row.classification_id + '"';
      if (
        classification_id != null &&
        row.classification_id == classification_id
      ) {
        classificationList += " selected ";
      }
      classificationList += ">" + row.classification_name + "</option>";
    });
    classificationList += "</select>";
    return classificationList;
  } catch (error) {
    throw error;
  }
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedIn = true;
        next();
      }
    );
  } else {
    next();
  }
};

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedIn) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

/* ****************************************
 * Middleware to check if user is Admin or Employee
 * Only allows access if the user is either an Admin or Employee
 **************************************** */
Util.requireAdminOrEmployee = (req, res, next) => {
  const accountData = req.session.accountData;
  if (
    accountData &&
    (accountData.accountType === "Admin" ||
      accountData.accountType === "Employee")
  ) {
    next();
  } else {
    req.flash("notice", "You do not have permission to access this page.");
    return res.redirect("/account/login");
  }
};

module.exports = Util;
