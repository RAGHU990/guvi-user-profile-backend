

require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const connection = require("./db");
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');

// database connection
connection()

// middlewares
app.use(express.json());
app.use(cors({
 origin:"*",
}));
app.options('*', cors());

const bodyParser = require('body-parser')



// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// routes
 app.set("/api/users", userRoutes);

 const router = require('express').Router();
const{ User, validate} = require("./models/user");
const bcrypt = require("bcrypt");

//login
app.post("/login", async (req, res) => {
	try {
		// const { error } = validate(req.body);
        // console.log("backed")
		// if (error)
		// 	return res.status(400).send({ message: error});

		const user = await User.findOne({ email: req.body.email });
		if (!user)
			return res.status(401).send({ message: "Invalid Email or Password" });

		const validPassword = await bcrypt.compare(
			req.body.password,
			user.password
		);
		if (!validPassword)
			return res.status(401).send({ message: "Invalid Email or Password" });

		const token = user.generateAuthToken();
		res.status(200).send({ data: token, message: "logged in successfully" });
	} catch (error) {
        console.log("error:",error)
    
		res.status(500).send({ message: "Internal Server Error" });
	}
});

//register
app.post("/register",async(req,res) => {
    try {
        console.log("backend",req.body)
        const {error} = validate(req.body);
        if(error)
           return res.status(400).send({message: error});

        const user = await User.findOne({email: req.body.email});
        if(user)
        return res.status(409).send({message: "User with given email already exist!"})

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.password,salt);

        await new User({...req.body,password:hashPassword}).save();
        res.status(201).send({message:"User created sucessfully"})
    } catch (error) {
        console.log("error:",error)
        res.status(500).send({message: "Internal Server Error "})
    }
})
const port = 8080;
app.listen(port, () => {
    console.log(`Listening on port ${port}...`)
    
})




