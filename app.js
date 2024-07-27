
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./DB/db.js");
const authRoutes = require('./Routes/authRoutes');
const cookieParser =require('cookie-parser')
const {requireAuth, checkUser} = require('./Middleware/authmiddleware.js')

dotenv.config();
connectDB();
const app = express();

// middleware
app.use(express.static('public'));
app.use(express.json()); //take json and parse jsobject
app.use(cookieParser());

// view engine
app.set('view engine', 'ejs');

// routes
app.get('*', checkUser);
app.get('/', (req, res) => res.render('home'));
app.get('/smoothies', requireAuth,(req, res) => res.render('smoothies'));
app.use(authRoutes);


//cookies
// app.get('/set-cookies', (req,res)=>{
// //    res.setHeader('set-Cookie', 'newUser = true');
//    res.cookie('newUser',false);
//    res.cookie('isEmplyoee',true,{maxAge: 1000*60 *60 *24, httpOnly:true });

//    res.send('you got the cookies');
// });

// app.get('/read-cookies',(req,res)=>{
//     const cookies =req.cookies;
//     console.log(cookies);
//     res.json(cookies);
// })



const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

