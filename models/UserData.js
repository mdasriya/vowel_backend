const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    FullName: {
        type: String,
        required: true,
        trim: true,
    },
    Email: {
        type: String,
        required: true,
        trim: true,
    },
    AccountType: {
        type: String,
        enum: ["Admin", "User"],
        required: true,
    },
    Address: {
        type: String,
        // required: true,
        trim: true,
    },
    County: {
        type: String
    },
    Postcode: {
        type: Number,
        // required: true,
    },
    Phone: {
        type: Number,
        // required: true,
    },
    Notes: {
        type: String
    },
    Password: {
        type: String,
        // required: true,
    },
    Image: {
        type: String
    },
    Token: {
        type: String,
    },
    Products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
            quantity: {
                type: Number,
                default: 1 // Set a default quantity if not provided
            }
        }
    ],

});

module.exports = mongoose.model("User", userSchema);