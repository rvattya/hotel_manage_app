const UserModel = require('../Models/UserModel');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const dotenv = require('dotenv');
const {singlefile}= require('../Middleweres/multerMiddleware')
dotenv.config();


//signup user and admin both can signup 
// const signup = async (req, res) => {
//     try {
//         const { name, email, number, password,role } = req.body;
//         const profileimg = req.file ? req.file.originalname : null;
//         const hashpassword = await bcrypt.hash(password, 10);
//         const user = new UserModel({
//             name, email, password: hashpassword, number, role, profileimg
//         });
//         await user.save();
//         res.status(200).json({ message: "user details saved successfully" });
//         console.log(user);


//     } catch (error) {
//         res.status(500).send({ message: "somthing want rong Plz Try again latter" });

//     }

// };
const signup = async (req, res) => {
    singlefile(req,res,async(err)=>{
        if(err){
            return res.status(403).json({message:err.message});
        }
        // if user not update profie photo
        if(!req.files || req.files.length=== 0){
            return res.status(400).json({ message: "Please upload profile images." });

        }
    
    try {
        let { name, email, phone, password, role, profileImage } = req.body;
        if(!role || role.trim()=== ''){
            role = 'user'; // Default role is 'user'
        }

        const userExists = await UserModel.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashpassword = await bcrypt.hash(password, 10);

        const user = await UserModel.create({
            name,
            email,
            phone,
            password: hashpassword,
            profileImage,
            role, // Will be set to 'user' if not provided
        });

        const token = JWT.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: '24h' } // Token expiry is set to 24 hours
        );

        res.status(201).json({ message: "User created successfully", token });
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
});
};

// admin for admin

const adminlogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await UserModel.findOne({ email });
        if(!admin){
            return res.status(404).json({message:"admin not found"});
        }
        //check if admin exists
        if (admin.role !=='admin') { res.status(403).json({ message: "Access denied, not an admin" }) };
        // verified password

        const isvalidpassword = await bcrypt.compare(password, admin.password);

        if (!isvalidpassword) {
            res.status(500).json({ message: " invelid password" })
        };
        //generate token for isadmin

        const token = JWT.sign({ id: admin._id, email: admin.email, role: admin.role }, process.env.JWT_KEY, { expiresIn: "24h" });
        res.status(200).json({ message: "Admin logged in successfully", token })

    } catch (error) {
        res.status(500).json({ mesaage: "something want rong", error: error.mesaage });


    }

};
// const adminlogin = async (req, res) => {
//     try {
//       const admin = await Admin.findOne({ username: req.body.username });
  
//       if (!admin) {
//         return res.status(404).json({ message: "Admin not found" });
  
//       }
  
//       const isPasswordValid = await bcrypt.compare(req.body.password, admin.password);
  
//       if (!isPasswordValid) {
//         return res.status(401).json({ message: "Invalid password" });
  
//       }
  
  
//       return res.status(200).json({ message: "Login successful", admin });
//     } catch (error) {
//       return res.status(500).json({ message: "Internal server error" });
//     }
//   };
const getalluser = async (req, res) => {
    try {
        const user = await UserModel.find();
        res.status(200).json(user);
        console.log(user);

    } catch (error) {
        res.status(500).json({ message: error.message });

    }
}

const getUserById = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await UserModel.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = { signup, adminlogin, updateUser, deleteUser, getUserById, getalluser };