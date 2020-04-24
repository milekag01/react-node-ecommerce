const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');
const Product = require('../models/product');
const {errorHandler}  =require('../helpers/dbErrorHandler');

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