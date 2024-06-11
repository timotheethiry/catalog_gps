const { Validator } = require('node-input-validator');

const productRules = {
    name: 'required|string|length:100',
    description: 'required|string|length:1000',
    imageUrl: 'required|url|length:255',
    price: 'required|numeric|min:0|max:10000',
    categories: 'array|length:10' 
};

exports.productValidation = async (input) => {
    const productValidator = new Validator(input, productRules);

    const isValid = await productValidator.check();
    return isValid;
}