const jwt = require('jsonwebtoken');

// CHECK IF USER IS AUTHENTICATED

module.exports = (req, res, next) => {
    try {

        const token = req.headers.authorization.split(' ')[1];

        const decodeToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');

        const userId = decodeToken.userId;

        res.locals.userId = userId;
        
        next();

    } catch (error) {
        res.status(401).json({ message: 'Authentication failed', error: error});
    }
};