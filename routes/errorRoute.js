const express = require("express");
const router = express.Router();
const errorController = require("../controllers/errorController");

// Route to intentional error
router.get("/start-error", errorController.triggerError);

module.exports = router;

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render("error", { message: "Internal Server Error" });
};

module.exports = errorHandler;
