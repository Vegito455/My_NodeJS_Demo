const express = require("express");
var router = express.Router();

const {
  getproductById,
  createProduct,
  getProduct,
  getAllProducts,
  getPhoto,
  upadateProduct,
  deleteProduct,
  getAllUniqueCategories
} = require("../controllers/product");


const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");
const { getUserById } = require("../controllers/user");

router.param("userId", getUserById);
router.param("productID", getproductById);

router.post(
  "/product/create/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  createProduct
);

// read routes
router.get("/product/:productID", getProduct);
router.get("/product/photo/:productID", getPhoto);

router.get('/products', getAllProducts);

router.get('/products/categories', getAllUniqueCategories);

// update route
router.put(
  "/product/:productID/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  upadateProduct
);

// delete route
router.delete(
  "/product/:productID/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  deleteProduct
);

module.exports = router;
