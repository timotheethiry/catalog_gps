const AppError = require('../middleware/AppError');
const tryCatchWrapper = require('../middleware/tryCatchWrapper');

const Product = require('../models/product');
const Category = require('../models/category');
const User = require('../models/user');

const { productValidation } = require('../security/validInput');


exports.getProduct = tryCatchWrapper(async (req, res, next) => {

    const existingProduct = await Product.findOne({ _id: req.params.id });

    if (!existingProduct) {
        return next(new AppError('Product not found', 404));
    }
    return res.status(200).json(existingProduct);
});


exports.getAllProducts = tryCatchWrapper(async (req, res, next) => {

    const existingProducts = await Product.find();
    if (!existingProducts) {
        return next(new AppError('Products not found', 404));
    }
    return res.status(200).json(existingProducts);
});


exports.getAllProductsByCategory = tryCatchWrapper(async (req, res, next) => {

    const existingProducts = await Product.find({ categories: req.params.id });
    
    if (!existingProducts) {
        return next(new AppError('Products not found', 404));
    }
    return res.status(200).json(existingProducts);
});


exports.createProduct = tryCatchWrapper(async (req, res, next) => {

    const currentUser = await User.findOne({ userId: res.locals.userId });

    if (!currentUser) {
        return next(new AppError('User not found', 404));
    }

    if (!currentUser.isAdmin) {
        return next(new AppError('Access denied', 401));
    }

    const productInput = req.body;
    const isValid = await productValidation(productInput);

    if (!isValid) {
        return next(new AppError('Bad format. Check the required fields and length', 400));
    }

    const product = new Product({
        name: productInput.name,
        description: productInput.description,
        imageUrl: productInput.imageUrl,
        price: productInput.price,
        categories: productInput.categories
    });
    
    const newProduct = await product.save();

    if (!newProduct) {
        return next(new AppError('Product creation failed', 400));
    }

    updateNewProductCorrespondingCategories(newProduct);

    return res.status(201).json({ message: 'Product created successfully', product: newProduct });
});


exports.modifyProduct = tryCatchWrapper(async (req, res, next) => {

    const currentUser = await User.findOne({ userId: res.locals.userId });

    if (!currentUser) {
        return next(new AppError('User not found', 404));
    }

    if (!currentUser.isAdmin) {
        return next(new AppError('Access denied', 401));
    }

    const productInput = req.body;
    const isvalid = await productValidation(productInput);

    if (!isvalid) {
        return next(new AppError('Bad format. Check the required fields and length', 400));
    }

    const existingProduct = await Product.findOneAndUpdate({ _id: req.params.id }, productInput);

    if (!existingProduct) {
        return next(new AppError('Product not found', 404));
    }

    updateModifiedProductCorrespondingCategories(existingProduct, productInput);

    return res.status(200).json({ message: 'Product updated successfully', product: existingProduct });
});


exports.deleteProduct = tryCatchWrapper(async (req, res, next) => {

    const currentUser = await User.findOne({ userId: res.locals.userId });

    if (!currentUser) {
        return next(new AppError('User not found', 404));
    }

    if (!currentUser.isAdmin) {
        return next(new AppError('Access denied', 401));
    }

    const existingProduct = await Product.findOneAndDelete({ _id: req.params.id });

    if (!existingProduct) {
        return next(new AppError('Product not found', 404));
    }

    updateDeletedProductCorrespondingCategories(existingProduct);

    return res.status(200).json({ message: 'Product deleted successfully' });
});


async function updateNewProductCorrespondingCategories(newProduct) {
    if (newProduct.categories) {
        for (const category of newProduct.categories) {
            try {
                await Category.updateOne({ name: category }, { $addToSet: { productIds: newProduct._id }});
            } catch (error) {
                return next(new AppError(`Category ${category} update failed for product ID ${newProduct._id}`, 500));
            }
        }
    }
}


async function updateModifiedProductCorrespondingCategories(originalProduct, productInput) {
    const originalCategories = originalProduct.categories;
    const updatedCategories = productInput.categories || originalCategories;
    const removedCategories = originalCategories.filter(category => !updatedCategories.includes(category));

    for (const category of removedCategories) {
        try {
            await Category.updateOne({ name: category }, { $pull: { productIds: originalProduct._id }});
        } catch (error) {
            return next(new AppError(`Category "${category}" update failed for product ID "${originalProduct._id}"`, 500));
        }
    }
}


async function updateDeletedProductCorrespondingCategories(originalProduct) {
    if (originalProduct.categories) {  
        for (const category of originalProduct.categories) {
            try {
                await Category.updateOne({ name: category }, { $pull: { productIds: originalProduct._id }});
            } catch (error) {
                return next(new AppError(`Category "${category}" update failed for product ID "${originalProduct._id}"`, 500));
            }
        }
    }
}



