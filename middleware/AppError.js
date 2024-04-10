
// CUSTOM ERROR CLASS FOR GLOBAL HANDLING

module.exports = class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = statusCode < 500 ? 'error' : 'failure';

        Error.captureStackTrace(this, this.constructor);
    }
}; 