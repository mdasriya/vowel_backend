const express = require("express");
const app = express();
const cors = require("cors")
const database = require("./config/DBconnection")
const paymentRoutes = require("./routes/payments");
const userRoutes = require("./routes/user");
const productRoutes = require("./routes/Product");
const fileUpload = require("express-fileupload");
const { cloudinaryConnect } = require("./config/cloudinary");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT || 4000;

database.connect();

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: "*",
        credentials: true,
    })
);
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
    })
);

cloudinaryConnect();
  
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);

app.get("/", (req, res) => {
	return res.json({
		success: true,
		message: "Your server is up and running ...",
	});
});

app.listen(PORT, () => {
	console.log(`App is listening at ${PORT}`);
});