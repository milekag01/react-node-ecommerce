const express = require('express');
const router = express.Router();

// controllers
const {signup} = require('../controllers/user');
const {userSignupValdator} = require('../validator/index');

router.post('/signup', userSignupValdator, signup);

module.exports = router;