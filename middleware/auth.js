const jwt = require('jsonwebtoken');

/* take token from request header, compare the client userId and the token userId */
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodeToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        const userId = decodeToken.userId;
        res.locals.userId = userId;
        next();
    } catch (error) {
        res.status(401).json({ error : error | 'Authentification failed !'});
    }
};