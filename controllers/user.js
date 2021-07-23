const User = require("../models/user");
const Order = require("../models/order");

exports.getUserById = (req, res, next, id) => {
    console.log("inside getUserById")
    User.findById(id).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error_message: "User not found in Database",
                error: err
            })
        }
        req.profile = user;
        next();
    })
}

exports.getUser = (req, res) => {
    console.log("inside getUser")

    req.profile.salt = undefined;   //dont want to show salt and encry_password
    req.profile.encry_password = undefined;
    req.profile.createdAt = undefined;    //dont want to show createdAt and updatedAt
    req.profile.updatedAt = undefined;

    return res.json(req.profile)
}

exports.updateUser = (req, res) => {
    User.findByIdAndUpdate(
        { _id: req.profile._id },
        { $set: req.body },
        { new: true, useFindAndModify: false },
        (err, user) => {

            if (err || !user) {
                return res.status(400).json({
                    error: "Updation is not successfull!"
                });
            }

            user.salt = undefined;
            user.encry_password = undefined;
            return res.json(user)
        }
    )
}

exports.userPurchaseList = (req, res) => {
    Order.find({ user: req.profile._id })
        .populate("user", "_id name email")
        // .populate("user","_id name")
        .exec((err, order) => {
            if (err) {
                return res.status(400).json({
                    error: "No order found for user!"
                });
            }
            return res.json(order);
        })

}


exports.pushOrdersInPurchaseList = (req, res, next) => {

    let purchases = [];
    // will be receiving product data from front-end and will be updated in DB
    req.body.order.products.forEach(product => {
        purchases.push({
            _id: product._id,
            name: product.name,
            description: product.description,
            category: product.category,
            quantity: product.quantity,
            amount: req.body.order.amount,
            transaction_id: req.body.order.transaction_id
        })
    })

    // store purchases array in DB
    User.findOneAndUpdate(
        { _id: req.profile._id },
        { $push: { purchases: purchases } },
        { new: true }     //send me data from the Db which is updated one not the old one
    )
        .exec((err, puchases) => {
            if (err) {
                return res.status(400).json({
                    error_message: "Unable to save purchase list!",
                    error: err
                })
            }
            next();
        })



}


// Test Start==========
exports.getAllUsers = (req, res) => {
    console.log("inside getAllUsers")
    User.find().exec((err, users) => {
        if (err) {

            return res.status(400).json({
                err_message: "Not able to fetch users in Database",
                err: [err]
            });
        }
        return res.json(users);

    });

}
// Test End============