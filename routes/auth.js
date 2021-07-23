var express = require('express')
const { body } = require('express-validator');
var router = express.Router();

const { signout, signin, signup, isSignedIn } = require("../controllers/auth");


router.post("/signup", [
    body('name', "name should ne at least of 3 character").isLength({ min: 3 }), //Validation is implemented here
    body('email', "Valid Email is required").isEmail(),  //Validation is implemented here 
    body('password', "Password should be at least 3 character").isLength({ min: 3 })  //Validation is implemented here
], signup)



router.post("/signin", [
    body('email', "Valid Email is required").isEmail(),  //Validation is implemented here 
    body('password', "Password should be at least 3 character").isLength({ min: 3 })  //Validation is implemented here
], signin)
router.get("/signout", signout);


router.get("/signout", signout);

router.get("/protectedRoute", isSignedIn, (req, res) => {

    res.json(req.auth)
});




module.exports = router;