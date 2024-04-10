const express = require('express');

const auth = require('../middleware/auth');
const userCtr = require('../controllers/user');

const router = express.Router();


router.post('/signup', userCtr.createUser);

router.post('/login', userCtr.logUser);

router.use(auth);

router.delete('/:id', userCtr.deleteUser);

router.get('/', userCtr.getAllUsers);

router.get('/:id', userCtr.getUser);

router.put('/:id', userCtr.updateUser);

module.exports = router;