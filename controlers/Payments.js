const { instance } = require("../config/razorpay");
const Product = require("../models/Product");
const User = require("../models/UserData");
const crypto = require("crypto");
const mongoose = require("mongoose");

// Capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  const { total_amount } = req.body;

  // console.log("total_amount : ", total_amount);
  if (!total_amount) {
    return res.status(400).json({
      success: false,
      message: "All Fields are Mandatory",
    });
  }

  // console.log("inside backend");
  const options = {
    amount: total_amount * 100,
    currency: "INR",
    receipt: Math.random(Date.now()).toString(),
  };

  try {
    // Initiate the payment using Razorpay
    const paymentResponse = await instance.orders.create(options);
    // console.log(paymentResponse);
    return res.json({
      success: true,
      data: paymentResponse,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Could not initiate order." });
  }
};

// verify the payment
exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, idsAndQuantity, userId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !idsAndQuantity || !userId) {
    return res.status(400).json({ success: false, message: "Incomplete payment details" });
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET).update(body.toString()).digest("hex");

  // console.log("inside payment Verify");

  if (expectedSignature === razorpay_signature) {
    try {
      await addProduct(idsAndQuantity, userId);
      return res.status(200).json({ success: true, message: "Payment Verified" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, error: "Error adding products" });
    }
  } else {
    return res.status(400).json({ success: false, message: "Invalid signature" });
  }
};

// Add product in user data
const addProduct = async (productsWithQuantities, userId) => {
  if (!productsWithQuantities || !userId) {
    throw new Error("Please provide product ID and user ID");
  }

  // console.log("Product id and quantity : ", productsWithQuantities);

  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    for (const { _id, quantity } of productsWithQuantities) {
      user.Products.push({ product: _id, quantity });
      await Product.findByIdAndUpdate(_id, { $push: { User: user._id } });
    }

    await user.save();

    return true; // Indicate success
  } catch (error) {
    console.log(error);
    throw new Error("Error adding products to user");
  }
};

exports.tempdata = (req, res) => {
  console.log("inside backend");
  const { name } = req.body;
  
  return res.status(200).json({ success: true, message: "Data received successfully", data: name });
};
