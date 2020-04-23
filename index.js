const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');

// routes
const userRoutes = require('./routes/auth');
// app
const app = express();

// database connection
mongoose.connect(process.env.MONGODB_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true
}).then(() => {
    console.log('Database Connected');
});

// middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());

// routes middleware
app.use('/api',userRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
