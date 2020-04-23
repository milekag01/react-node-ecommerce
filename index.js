const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');

// routes
const userRoutes = require('./routes/user');
// app
const app = express();

// database connection
mongoose.connect(process.env.MONGODB_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true
}).then(() => {
    console.log('Database Connected');
});

// routes middleware
app.use('/api',userRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
