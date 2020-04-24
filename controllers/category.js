const Category = require('../models/category');
const {errorHandler}  =require('../helpers/dbErrorHandler');


exports.create = async (req,res) => {
    const category = new Category(req.body);
    try {
        await category.save();
        res.json({
            category: category
        });

    } catch (error) {
        return res.status(400).json({
            error: errorHandler(error)
        })
    }
}