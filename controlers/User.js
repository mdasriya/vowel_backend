const User = require("../models/UserData");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
require("dotenv").config()


exports.auth = async (req, res, next) => {
    try {
        //extract token
        // console.log("req.cookies.token ", req.cookies.Token);
        // console.log("req.cookies.token 2 : ", req.body.Token);
        // console.log("req.cookies.token 3 : ", req.header("Authorization").replace("Bearer ", ""));
        const token = req.cookies.Token || req.body.Token || req.header("Authorization").replace("Bearer ", "");

        //if token missing, then return responce
        // console.log("Token ", token);
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing",
            })
        }

        //verify the token
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            // console.log(decode);
            req.user = decode;
        }
        catch (err) {
            //verification - issue
            return res.status(404).json({
                success: false,
                message: 'Token is invalid',
            });
        }
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Something went wrong while validating the token',
        });
    }
}

exports.signUp = async (req, res) => {
    try {
        const {
            FullName,
            Email,
            Password,
            ConfirmPass,
            AccountType = "User"
        } = req.body

        if (!FullName || !Email || !Password || !ConfirmPass) {
            return res.status(403).send({
                success: false,
                message: "All Fields are required",
            })
        }

        // Check if password and confirm password match
        if (Password !== ConfirmPass) {
            return res.status(400).json({
                success: false,
                message:
                    "Password and Confirm Password do not match. Please try again.",
            })
        }

        // Check if user already exists
        const existingUser = await User.findOne({ Email })
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists. Please sign in to continue.",
            })
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(Password, 10);

        const user = await User.create({
            FullName,
            Email,
            AccountType,
            Password: hashedPassword,
            Image: `https://api.dicebear.com/5.x/initials/svg?seed=${FullName}`,
            Address: null,
            County: null,
            Postcode: null,
            Phone: null,
            Notes: null,
        })

        return res.status(200).json({
            success: true,
            user,
            message: "User registered Successfully ",
        })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "User cannot be registered. Please try again.",
        })
    }
}

exports.login = async (req, res) => {
    try {
        // Get email and password from request body
        const { Email, Password } = req.body

        // Check if email or password is missing
        if (!Email || !Password) {
            // Return 400 Bad Request status code with error message
            return res.status(400).json({
                success: false,
                message: `Please Fill up All the Required Fields`,
            })
        }

        // Find user with provided email
        const user = await User.findOne({ Email });

        // If user not found with provided email
        if (!user) {
            // Return 401 Unauthorized status code with error message
            return res.status(401).json({
                success: false,
                message: `User is not Registered with Us Please SignUp to Continue`,
            })
        }

        // Generate JWT token and Compare Password
        if (await bcrypt.compare(Password, user.Password)) {
            const token = jwt.sign(
                { email: user.Email, id: user._id },
                process.env.JWT_SECRET,
                {
                    expiresIn: "24h",
                }
            )

            // Save token to user document in database
            user.Token = token
            user.Password = undefined
            // Set cookie for token and return success response
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            }
            res.cookie("Token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: `User Login Success`,
            })
        } else {
            return res.status(401).json({
                success: false,
                message: `Password is incorrect`,
            })
        }
    } catch (error) {
        console.error(error)
        // Return 500 Internal Server Error status code with error message
        return res.status(500).json({
            success: false,
            message: `Login Failure Please Try Again`,
        })
    }
}

exports.updateUserDetails = async (req, res) => {
    try {
        const {
            // FirstName,
            // LastName,
            // Email,
            Address,
            County,
            Postcode,
            Phone,
            Notes = "",
        } = req.body;

        // console.log("req.body : ", req.body);
        // console.log("req.body : ", req);
        const id = req.user.id
        const userDetails = await User.findById(id)

        if (!Address || !Postcode || !Phone || !County) {
            return res.status(403).send({
                success: false,
                message: "All Fields are required",
            })
        }

        userDetails.Address = Address
        userDetails.Postcode = Postcode
        userDetails.Phone = Phone
        userDetails.County = County
        userDetails.Notes = Notes

        await userDetails.save();

        const updatedUserDetails = await User.findById(id);

        // // Update the profile fields
        // profile.dateOfBirth = dateOfBirth
        // profile.about = about
        // profile.contactNumber = contactNumber
        // profile.gender = gender

        // const user = await User.create({
        //     FirstName,
        //     LastName,
        //     Email,
        //     Address,
        //     Postcode,
        //     Phone,
        //     County,
        //     Notes,
        // })

        return res.status(200).json({
            success: true,
            updatedUserDetails,
            message: "User Details Updated Successfully ",
        })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "User Details cannot be Updated. Please try again.",
        })
    }
}

exports.getUserDetails = async (req, res) => {
    try {
        const id = req.user.id;
        const user = await User.findById(id).populate('Products.product').exec();

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not Present. Please Sign up to continue.",
            });
        }



        return res.status(200).json({
            success: true,
            user,
            message: "User Details Fetched Successfully ",
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Please try again.",
        });
    }
};
