const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const connectFlash = require("connect-flash");
const expressMessages = require("express-messages");
const connectPgSimple = require("connect-pg-simple")(session);
const pool = require('./database/');
const utilities = require("./utilities/");
const validate = require("./utilities/account-validation");

// Controllers and Routes
const baseController = require("./controllers/baseController");
const staticRoutes = require("./routes/static");
const inventoryRoutes = require("./routes/inventoryRoute");
const accountRoutes = require("./routes/accountRoute");
const reviewRoutes = require("./routes/reviewRoute");
const errorRoutes = require("./routes/errorRoute");

const app = express();

// Session setup
app.use(session({
  store: new connectPgSimple({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}));

// Flash messages middleware
app.use(connectFlash());
app.use(function (req, res, next) {
  res.locals.messages = expressMessages(req, res);
  next();
});

// Body parser and cookie parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Custom middleware to check JWT token
app.use(utilities.checkJWTToken);

// Custom middleware to set loggedIn
app.use(validate.checkAuthentication);

// View engine setup
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

// Routes
app.use(staticRoutes);
app.get("/", utilities.handleErrors(baseController.buildHome));
app.use('/inv', inventoryRoutes);
app.use('/account', accountRoutes);
app.use('/reviews', reviewRoutes);  // Ensure this line is included
app.use('/error', errorRoutes);

// 404 error handling route
app.use(async (req, res, next) => {
  next({status: 404, message: '<h1>Oops...It broke!</h1><p>Sorry, we appear to have lost that page.(404)</p>'});
});

// Express error handler
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  console.error(err.stack);  // Print stack trace for debugging
  let message = '';
  if (err.status === 404) { 
    message = err.message;
    res.status(404).render("errors/error", {
      title: '404 - Not Found',
      message,
      nav
    });
  } else {
    message = '<h1>Oh no!</h1> <p>There was a crash. Maybe try a different route?</p>';
    res.status(500).render("errors/error", {
      title: 'Server Error',
      message,
      nav
    });
  }
});

// Local server information
const port = process.env.PORT;
const host = process.env.HOST;

// Start server
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});
