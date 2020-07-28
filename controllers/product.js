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
            res.json(result);
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

exports.listRelated = (req,res) => {
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;

    Product.find({_id: {$ne: req.product}, category: req.product.category})
            .select('-photo')
            .limit(limit)
            .populate('category', '_id name')
            .exec((error, products) => {
                if (error) {
                    res.status(400).json({
                        error: 'Products not found'
                    });
                }
                res.json(products);
            })
}

exports.listCategories = (req, res) => {
    Product.distinct('category', {}, (error, categories) => {
        if (error) {
            res.status(400).json({
                error: 'Categories not found'
            });
        }
        res.json(categories);
    })
}

/**
 * list products by search
 * we will implement product search in react frontend
 * we will show categories in checkbox and price range in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * we will make api request and show the products to users based on what he wants
 */

exports.listBySearch = (req, res) => {
    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);     // for load more button

    let findArgs = {};
 
    // console.log(order, sortBy, limit, skip, req.body.filters);
    // console.log("findArgs", findArgs);
 
    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === "price") {
                // gte -  greater than price [0-10]
                // lte - less than
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }
 
    Product.find(findArgs)
        .select("-photo")
        .populate("category")
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((error, data) => {
            if (error) {
                return res.status(400).json({
                    error: "Products not found"
                });
            }
            res.json({
                size: data.length,
                data
            });
        });
};

// will be used as a middleware: i.e. runs everytime we request for product
exports.photo = (req, res, next) => {
    if(req.product.photo.data) {
        res.set('Content-Type', req.product.photo.contentType);
        return res.send(req.product.photo.data);
    }
    next();
}

// for search bar
exports.listSearch = (req, res) => {
    // create query object to hold search value and category value
    const query = {};
    // assign search value to query.name
    if (req.query.search) {
        query.name = { $regex: req.query.search, $options: 'i' };
        // assigne category value to query.category
        if (req.query.category && req.query.category != 'All') {
            query.category = req.query.category;
        }
        // find the product based on query object with 2 properties
        // search and category
        Product.find(query, (err, products) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(products);
        }).select('-photo');
    }
};