// SHARED ERROR CATCH BLOCK

module.exports = (func) => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
};