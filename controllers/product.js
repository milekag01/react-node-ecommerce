const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');
const Product = require('../models/product');
const {errorHandler}  =require('../helpers/dbErrorHandler');

exports.productById = async (req,res,next,id) => {
    try {
        const product = await Product.findById(id);
        if(!product) {
            return res.status(400).json({
                error: 'Product not found'
            });
        }
        req.product = product;
        next();
    } catch(error) {
        res.status(400).json({
            error: 'Something went wrong'
        })
    }
}

exports.read = (req,res) => {
    req.product.photo = undefined;  // due to huge size...
    // we avoid sending it with other data...instead we will create seperate method for photos
    return res.json(req.product);
}

exports.create = (req,res) => {
    
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (error, fields, files) => {
        if(error) {
            return res.status(400).json({
                error: 'Image upload failed'
            })
        }

        const {name, description, price, category, quantity, shipping} = fields;
        
        if(!name || !description || !price || !category || !quantity || !shipping) {
            return res.status(400).json({
                error: 'All fields are required'
            })
        }

        let product = new Product(fields);
        
        if(files.photo) {
            // 1kb = 1000
            // 1mb = 1000000
            if(files.photo.size > 1000000) {
                return res.status(400).json({
                    error: 'Image should be smaller than 1mb in size'
                });
            }
            product.photo.data = fs.readFileSync(files.photo.path);
            product.photo.contentType = files.photo.type;
        }
        console.log(product);
        product.save((error, result) => {
            if(error) {
                console.log(error);
                return res.status(400).json({
                    error: errorHandler(error)
                })
            }
            res.json({result: result});
        });
    });
}

exports.remove = async (req, res) => {
    const product = req.product;
    try {
        await product.remove();
        return res.json({
            message: 'Product deleted successfully'
        });
    } catch(error) {
        res.status(400).json({
            error: errorHandler(error)
        })
    }
}

exports.update = (req,res) => {
    
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (error, fields, files) => {
        if(error) {
            return res.status(400).json({
                error: 'Image upload failed'
            })
        }

        const {name, description, price, category, quantity, shipping} = fields;
        
        if(!name || !description || !price || !category || !quantity || !shipping) {
            return res.status(400).json({
                error: 'All fields are required'
            })
        }

        let product = req.product;  // fetch existing product
        product = _.extend(product, fields);
        
        if(files.photo) {
            // 1kb = 1000
            // 1mb = 1000000
            if(files.photo.size > 1000000) {
                return res.status(400).json({
                    error: 'Image should be smaller than 1mb in size'
                });
            }
            product.photo.data = fs.readFileSync(files.photo.path);
            product.photo.contentType = files.photo.type;
        }
        console.log(product);
        product.save((error, result) => {
            if(error) {
                console.log(error);
                return res.status(400).json({
                    error: errorHandler(error)
                })
            }
            res.json({result: result});
        });
    });
}

/** 
sell / arrival 
by sell = /products?sortBy=sold&order=desc&limit=4
by arrival = /products?sortBy=createdAt&order=desc&limit=4
if no params are sent, all products are returned.
**/

exports.list = (req, res) => {
    let order = req.query.order ? req.query.order : 'asc';
    let sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;

    Product.find()
            .select('-photo')   // deselect photo from data
            .populate('category')
            .sort([[sortBy, order]])    // needs array of array
            .limit(limit)
            .exec((error, products) => {
                if (error) {
                    res.status(400).json({
                        error: 'Products not found'
                    });
                }
                res.json(products);
            })
}