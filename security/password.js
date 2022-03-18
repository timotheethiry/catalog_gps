const passwordValidator = require('password-validator');

const pwSchema = new passwordValidator();

pwSchema
.is().min(6)
.is().max(16)
.has().uppercase()
.has().lowercase()
.has().letters()
.has().digits(1)
.has().not().spaces()
.has().not().symbols()
.is().not().oneOf(['Passw0rd', 'Password123', 'Password0000', '000000', '012345', '123456']);

module.exports = pwSchema;