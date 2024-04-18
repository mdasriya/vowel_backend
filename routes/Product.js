const express = require("express");
const router = express.Router()

const { createProduct, editProduct, getAllProducts, deleteProduct, getProductDetails } = require("../controlers/Product");
const { auth } = require("../controlers/User");

router.post("/createProduct", auth, createProduct);
router.post("/editProduct", auth, editProduct);
router.get("/getAllProducts", getAllProducts);
router.post("/getProductDetails", getProductDetails);
router.delete("/deleteProduct", deleteProduct);

module.exports = router