const mongoose = require("mongoose");

//   _id: 1,
//   name: 'T-Shirt',
//   href: '#',
//   imageSrc: 'https://tailwindui.com/img/ecommerce-images/product-page-01-related-product-01.jpg',
//   imageAlt: "Front of men's Basic Tee in black.",
//   price: 35,
//   color: 'Black',

const productSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true,
        trim: true,
    },
    ImageSrc: {
        type: String,
        required: true,
    },
    Price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        // required: true,
    },
    Color: {
        type: String,
        required: true,
    },
    User: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
});

module.exports = mongoose.model("Product", productSchema);