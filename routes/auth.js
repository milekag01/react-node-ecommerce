const express = require('express');
const router = express.Router();

// controllers
const {signup, signin, signout, requiresSignin} = require('../controllers/auth');
const {userSignupValidator, userSigninValidator} = require('../validator/index');

router.post('/signup', userSignupValidator, signup);
router.post('/signin', userSigninValidator, signin);
router.get('/signout', signout);

module.exports = router;