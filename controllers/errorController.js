const errorController = {};

// Controller function forintentional error
errorController.triggerError = (req, res, next) => {
    try {
        nonExistentFunction();
    } catch (error) {
        next(error);
    }
};

module.exports = errorController;