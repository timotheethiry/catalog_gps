module.exports = (err, req, res, next) => {
    err.status = err.status || 'failure';
    err.statusCode = err.statusCode || 500;

    res.status(err.statusCode).json({
        status: err.status,
        statusCode: err.statusCode,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }); 
}