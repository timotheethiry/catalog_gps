const express = require('express'); 
const categoryCtr = require("../controllers/category");

const router = express.Router();

router.post('/', categoryCtr.createCategory);

router.put('/:id', categoryCtr.modifyCategory);

router.delete('/:id', categoryCtr.deleteCategory);

router.get('/:id', categoryCtr.getCategory);

router.get('/', categoryCtr.getAllCategory);

module.exports = router;