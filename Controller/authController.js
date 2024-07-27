const User = require('../Models/UserModel');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
  //handle errors
  const handleErrors=(err)=>{
    console.log(err.message, err.code);
    let error = { email: "", password: "" };

    //incorrect email
    if (err.message === "incorrect email") {
      error.email = "that email is not registered";
    }
    //incorrect password
    if (err.message === "incorrect passwor") {
      error.email = " possword is incorrect";
    }

    //duplicate error code
    if (err.code == 11000) {
      error.email = "user is alredy registered ";
      return error;
    }

    //vaildation errors
    if (err.message.includes("User validation failed")) {
      //  console.log(err);
      Object.values(err.errors).forEach(({ properties }) => {
        // console.log(properties);
        error[properties.path] = properties.message;
      });
    }
    return error;
  }
 const maxAge = 3*24*60*60;
 const  createToken =(id)=>{
         return jwt.sign({ id }, process.env.SIGNATURE, {
           expiresIn: maxAge,
         });
 }

module.exports.signup_get =(req,res) =>{
    res.render('signup');
}
module.exports.login_get = (req, res) => {
  res.render("login");
};

module.exports.signup_post = async(req, res) => {
    const {email , password} = req.body;

    try {
       const user = await User.create({email, password});
       const token = createToken(user._id);
       res.cookie('jwt',token, { httpOnly: true, maxAge: maxAge*1000})
       res.status(201).json({user: user._id});
    } 
    catch (err) {
        const errors = handleErrors(err);
        res.status(400).json(errors)
        
    }
  // res.send("new-signup");
};
module.exports.login_post = async(req, res) => {
  const {email,password} = req.body;

  try {
   const user  = await User.login(email,password);
   const token = createToken(user._id);
   res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
   res.status(201).json({ user: user._id });
   return;
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({errors});
  }
};

module.exports.logout_get = (req, res) => {
  //delete the jwt cookie or replace with a sort time blank cookie
  res.cookie('jwt', '',{ maxAge:1 });
  res.redirect("/");
};
module.exports.forgot_pass_get =(req,res)=>{
  res.render("forgotPass");
}

module.exports.forgot_pass_post = async(req,res)=>{
   const { email } = req.body;
   try {
     const user = await User.findOne({ email });
     if (!user) {
       return res
         .status(400)
         .json({ error: "User not find or incorret email" });
     }
     // generate token
     const token = jwt.sign({ userId: user._id }, process.env.SIGNATURE, {
       expiresIn: "1h",
     });
     user.resetPasswordToken = token;
     user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
     await user.save();
     // Send email
     const transporter = nodemailer.createTransport({
       service: "Gmail",
       secure: true,
       auth: { user: process.env.MY_GMAIL, pass: process.env.MY_PASSWORD },
     });

     const mailOptions = {
       to: user.email,
       from: "vkharkya@gmail.com",
       subject: "Password Reset",
       text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        http://${req.headers.host}/reset/${token}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
     };

     await transporter.sendMail(mailOptions, (err, response) => {
       if (err) {
         return res.status(500).json({ error: "Error sending email" });
       }
       res.status(200).json({ message: "Reset link sent on your gamil" });
     });
   } catch (error) {
    //  res.status(500).json({ error })
    console.log(error);
   }
}

module.exports.resetPassword_post = async (req, res) => {
 
  try {
     const { token } = req.params;
     const { password } = req.body;
     console.log( token , password ,'are the data is okay')
     if (!password) {
       return res.status(400).send({ message: "please provide password" });
     }
    
     const decode = jwt.verify(token, process.env.SIGNATURE);
    
    const user = await User.findOne({
    email : decode.email
    });

    // if (!user) {
    //   return res.status(400).json({ error: "Invalid or expired token" });
    // }
     const newhashPassword = async (passowrd) => {
      const saltRound = 10;
      return await bcrypt.hash(password, saltRound);
    };
    user.password = newhashPassword;
    // user.resetPasswordToken = undefined;
    // user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
