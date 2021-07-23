const Product = require('../models/product');
const formIdable = require('formidable');
const _ = require('lodash')
const fs = require('fs');


exports.getproductById = (res, req, next, id) => {
    Product.findById(id)
        .populate('category')
        .exec((err, product) => {

            if (err) {
                return res.status(400).json({
                    error: "Product not found!"
                });
            }
            req.product = product;
            console.log("this.getproductById===>", req.product);
            next();
        })

}

exports.createProduct = (req, res) => {

    let form = new formIdable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, file) => {
        if (err) {
            return res.status(400).json({
                error: "Unable to create product, something went wrong!"
            })
        }

        const { name, description, price, category, stock, photo } = fields;

        if (!name || !description || !price || !category || !stock || !file) {
            return res.status(400).json({
                error: "Please include all the fields"
            })
        }

        let product = new Product(fields);


        if (file.photo) {

            if (file.photo.size > 3000000) {
                return res.status(400).json({
                    error: "File size larger than max size!"
                })
            }

            product.photo.data = fs.readFileSync(file.photo.path);
            product.photo.contentType = file.photo.type;

        }

        product.save((err, product) => {

            if (err) {
                return res.status(400).json({
                    error: "Unable to add product in the database!"
                })
            }

            console.log(product);

            res.json(product);

        })

    })
}

exports.getAllProducts = (req, res) => {

    let limit = req.query.limit ? pareseInt(req.query.filter) : 8

    let sortBy = req.query.sortBy ? req.query.sortBy : "_id";

    Product.find()
        .select("-photo") // the - sign show that you do not wish to receive this photo data eg= .select("-photo -name -price")
        .populate("category")  //we populate all the data of the ObjectId present in category field
        .sort([[sortBy, "asc"]])
        .limit(limit)
        .exec((err, products) => {
            if (err) {
                return res.status(400).json({
                    error: "No Product found!"
                })
            }

            res.json(products);
        })
}


exports.getProduct = (req, res) => {
    req.product.photo = undefined;
    return res.json(req.product);
}

exports.getPhoto = (req, res, next) => {
    console.log("req.product===>", req.product)
    if (req.product.photo.data) {
        res.set('Content-Type', req.product.photo.contentType);
        return res.send(req.product.data);

    }
    next();
}

exports.upadateProduct = (req, res) => {

    let form = new formIdable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, file) => {
        if (err) {
            return res.status(400).json({
                error: "Unable to update product, something went wrong!"
            })
        }

        // updation code
        let product = req.product;
        product = _.extend(product, fields); //entend is used to update the data

        if (file.photo) {

            if (file.photo.size > 3000000) {
                return res.status(400).json({
                    error: "File size larger than max size!"
                })
            }

            product.photo.data = fs.readFileSync(file.photo.path);
            product.photo.contentType = file.photo.type;

        }

        product.save((err, product) => {

            if (err) {
                return res.status(400).json({
                    error: "Unable to update product in the database!"
                })
            }

            // console.log(product);

            res.json(product);

        })

    })
}

exports.deleteProduct = (req, res) => {

    let product = req.product;

    product.remove((err, deleteProduct) => {
        if (err) {
            return res.status(400).json({
                error: `Failed to delete ${product.name} product`
            });
        }
        res.json({
            message: `Product ${deleteProduct.name} deleted successfully!`,
            deleteProduct
        })
    })

}

exports.getAllUniqueCategories = (req, res) => {
    Product.distinct("category", {}, (err, category) => {
        if (err) {
            return res.status(400).json({
                error: "No category found!"
            })
        }

        res.json(category)
    })
}

exports.upadateStock = (req, res, next) => {

    let operations = req.body.order.products.map(prod => {
        return {
            updateOne: {
                filter: { _id: prod._id },
                update: { $inc: { stock: -prod.count, sold: +prod.count } }
            }
        }
    })

    Product.bulkWrite(operations, {}, (err, products) => {
        if (err) {
            return res.status(400).json({
                error: "Bulk operation failed"
            })
        }

        next();
    })

}
