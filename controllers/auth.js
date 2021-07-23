const User = require("../models/user")
const { validationResult } = require('express-validator');

const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');


exports.signup = (req, res) => {
    const user = new User(req.body);


    const validationErrors = validationResult(req); //check if any validation error has occured or not - validation implemented in auth-router
    if ((!validationErrors.isEmpty())) {
        return res.status(422).json({ // validation error send 422 status code 
            err_message: "Not able to save user in Database due to validation error",
            err: validationErrors.array()
        });
    }


    user.save((err, userRes) => {

        if (err) {

            return res.status(400).json({
                err_message: "Not able to save user in Database",
                err: [err]
            });
        } else {
            res.json({
                name: userRes.name,
                email: userRes.email,
                id: userRes._id
            });
        }
    });

}


exports.signin = (req, res) => {
    const { email, password } = req.body;

    const validationErrors = validationResult(req); //check if any validation error has occured or not - validation implemented in auth-router
    if ((!validationErrors.isEmpty())) {
        return res.status(422).json({ // validation error send 422 status code 
            err_message: "Not able to save user in Database due to validation error",
            err: validationErrors.array()[0].msg
        });
    }

    User.findOne({ email }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error_message: "User does not exists",
                error: [err]
            })
        }

        if (!user.autheticate(password)) {
           return res.status(401).json({
                error_message: "Email and password do not match"
            })
        }

        const token = jwt.sign({ _id: user._id }, process.env.SECRET)
        // put token in cookie
        // res.cookie("token", token, { expire: (60 * 60) })
        res.cookie('token',token,{expire:new Date() +9999});

        // send res to front end
        const { _id, name, email, role } = user;
        return res.json({
            token,
            user: {
                _id,
                name,
                email,
                role
            }
        })
    })



}



exports.signout = (req, res) => {
    res.clearCookie("token");

    res.json({
        message: "User Signout Successfully",
        status: 1
    });
}



// protected routes - Middleware
exports.isSignedIn = expressJwt({
    secret: process.env.SECRET,
    userProperty: "auth",
    // algorithms: ['RS256']
});



// custom middlewares
exports.isAuthenticated=(req,res,next)=>{

    let checker=req.profile && req.auth && req.profile._id == req.auth._id;
    console.log("checker===>",checker)
    if(!checker){
        return res.status(403).json({
            error:"ACCESS DENIED"
        })
    }
    next();
}

exports.isAdmin = (req, res, next) => {

    if (req.profile.role === 0) {
        return res.status(403).json({
            error_message: "You are not Admin, Access Denied",
            status: 0
        })
    }
    next();
}







