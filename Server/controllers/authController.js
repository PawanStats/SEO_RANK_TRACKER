import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//Generate JWT token
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "30d"});
}



 //Register user
export const register = async (req, res) => {
    try {
        const {name, email, password} = req.body;
        if (!name || !email || !password) return res.status(400).json({message: "All fields are required"});

        // Check if user already exists
        const exitingUser = await User.findOne({email});
        if (exitingUser) return res.status(400).json({message: "User already exists"});
         
        // hash password
        const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));

        // create user
      
        const user = await User.create({name, email, password: hashedPassword});
        // Generate token
        const token = generateToken(user._id);
        res.status(201).json({success: true, token, user: {id: user._id, name: user.name, email: user.email}})
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({message: "Server error"});

    } 
}

//Login user
export const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) return res.status(400).json({message: "All fields are required"});

        //Find user 
        const user = await User.findOne({email});
        if (!user) return res.status(400).json({message: "Invalid credentials"});

        // check passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({message: "Invalid credentials"});

        // Generate token
       
        const token = generateToken(user._id);
        res.json({success: true, token, user: {id: user._id, name: user.name, email: user.email}});
   
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({message: "Server error"});
    }
};
       
//get current user

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user){
            return res.status(400).json({success: false, message: "User not found"});
        }
        res.json({success: true, user});
    } catch (error) {
        console.error("Get user error:", error.message);
        res.status(500).json({success: false, message: "Server error"});
    }
};

       