const Category = require('../models/category');
const {errorHandler}  =require('../helpers/dbErrorHandler');


exports.categoryById = async (req,res,next,id) => {
    try {
        const category = await Category.findById(id);
        if(!category) {
            return res.status(400).json({
                error: 'category not found'
            });
        }
        req.category = category;
        next();
    } catch(error) {
        res.status(400).json({
            error: 'Something went wrong'
        })
    }
}

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

exports.read = (req, res) => {
    return res.json(req.category);
}

exports.update = async (req, res) => {
    const category = req.category;
    category.name = req.body.name;

    try {
        await category.save();
        return res.json(category);

    } catch (error) {
        res.status(400).json({
            error: errorHandler(error)
        });       
    }
}

exports.remove = async (req, res) => {
    const category = req.category;
 
    try {
        await category.remove();
        return res.json({
            message: 'Category removed successfully'
        });   
    } catch (error) {
        res.status(400).json({
            error: errorHandler(error)
        });       
    }
}

exports.list = async (req, res) => {
    try {
        const categories = await Category.find();
        if(!categories) {
            return res.status(400).json({
                message: 'No category available'
            })
        }
        res.json(categories);
        
    } catch(error) {
        res.status(400).json({
            error: errorHandler(error)
        })
    }
}