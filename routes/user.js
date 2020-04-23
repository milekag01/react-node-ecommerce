const express = require('express');
const router = express.Router();

// controllers
const {userById} = require('../controllers/user');

router.param('userId', userById);

module.exports = router;