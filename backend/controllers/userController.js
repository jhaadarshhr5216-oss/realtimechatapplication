const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const createTokenAndSaveCookie = require('../jwt/generateToken');

// SIGNUP
exports.signUp = async (req, res) => {
    try {
        const { fullname, name, email, password, confirmPassword } = req.body;

        // handle fullname or name
        const userFullname = fullname || name;

        if (!userFullname || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // check password match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create new user
        const newUser = new userModel({
            fullname: userFullname,
            email,
            password: hashedPassword
        });

        await newUser.save();

        // generate token
        createTokenAndSaveCookie(newUser._id, res);

        res.status(201).json({
            message: "User registered successfully",
            user: {
                _id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error("Error during sign up:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        createTokenAndSaveCookie(user._id, res);

        res.status(200).json({
            message: "Login successful",
            user: {
                _id: user._id,
                fullname: user.fullname,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// LOGOUT
exports.logout = (req, res) => {
    try {
        res.clearCookie("jwt");
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// GET ALL USERS
exports.allUsers = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        const filteredUsers = await userModel
            .find({ _id: { $ne: loggedInUserId } })
            .select("-password -__v");

        res.status(200).json(filteredUsers);

    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
