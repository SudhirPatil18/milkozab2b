import User from "../models/userModel.js";
export const CreateUser = async(req, res) =>{
    try{
        const {name, email} = req.body;
         await User.create({name, email})
        res.status(2001).json({message:"User Created"})
    }catch(err){
       res.status(500).json({message:err.message})
    }
}