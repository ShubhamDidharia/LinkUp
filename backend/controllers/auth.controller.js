import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js';

export const signup = async(req,res)=>{
    const {username,fullName,email,password} = req.body;
    const emailRegex  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email validation regex
    if(!emailRegex.test(email)){
        return res.status(400).json({error:"Invalid email format"});
    }

    const existingUser = await User.findOne({username: username});
    if(existingUser){
        return res.status(400).json({error:"Username already exists"});
    }

    const existingEmail = await User.findOne({email: email});
    if(existingEmail){
        return res.status(400).json({error:"Email already exists"});
    }

    if(password.length < 6){
        return res.status(400).json({error:"Password must be at least 6 characters long"});
    }

    try{
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            username,
            fullName,
            email,
            password: hashedPassword
        });
        if(newUser){
            // Function to generate token and set cookie
            generateTokenAndSetCookie(newUser._id,res);
            await newUser.save();
            res.status(201).json({message:"User created successfully", newUser});

        }else{
            res.status(400).json({error:"Failed to create user"});
        }
        
        
        
        
    }catch(err){
        console.error("Error creating user:", err);
        res.status(500).json({error:"Internal server error"});
    }
}
export const signin = async(req,res)=>{
    res.json({
        data:"hit the signin endpoint"
    })
}
export const login = async(req,res)=>{
    try{
        const {username , password}  = req.body; 
        const user = await User.findOne({username: username});
        if(!user){
            return res.status(400).json({error:"Invalid username or password"});
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({error:"Invalid username or password"});
        }
        // Function to generate token and set cookie
        generateTokenAndSetCookie(user._id, res);
        res.status(200).json({message:"Login successful", user});
    }catch(err){
        console.error("Error logging in:", err);
        res.status(500).json({error:"Internal server error"});
    }
}
export const logout = async(req,res)=>{
    try{
        //changed the cookie to clear the JWT token
        // Clear the JWT cookie by setting its maxAge to 0
        res.cookie("jwt","",{maxAge:0});
        res.status(200).json({message:"Logout successful"});
    }catch(err){
        console.error("error logging out:", err);
        res.status(500).json({error:"Internal server error"});
    }
}

