const express = require('express');

const auth = require('../middleware/auth');
const userCtr = require('../controllers/user');

const router = express.Router();


router.post('/signup', userCtr.createUser);

router.post('/login', userCtr.logUser);

router.delete('/:id', auth, userCtr.deleteUser);

router.get('/', auth, userCtr.getAllUsers);

router.get('/:id', auth, userCtr.getUser);

module.exports = router;