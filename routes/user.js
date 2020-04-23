const express = require('express');
const router = express.Router();

// controllers
const {sayHI} = require('../controllers/user');

router.get('/', sayHI);
module.exports = router;