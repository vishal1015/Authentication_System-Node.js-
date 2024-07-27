const jwt = require('jsonwebtoken');
const User = require('../Models/UserModel');

const requireAuth = (req,res,next) => {

    const token = req.cookies.jwt;
    
    //check json web token exist and verified
    if(token){
      jwt.verify(token, process.env.SIGNATURE,(err, decodedToken)=>{
           if(err){
            console.log(err.message);
            res.redirect('/login');
           }else{
             console.log(decodedToken);
             next();
           }
      });
    }else{
        res.redirect('/login');
    }
}

const checkUser = (req,res, next)=>{
    const token = req.cookies.jwt;

    if(token){
        jwt.verify(token, process.env.SIGNATURE, async(err, decodedToken) => {
          if (err) {
            console.log(err.message);
            res.locals.user = null;
            next();
          } else {
            console.log(decodedToken);
            let user = await User.findById(decodedToken.id);
            res.locals.user = user;
            next();

          }
        });
    }else {
        res.locals.user = null;
        next();
    }
}
module.exports = { requireAuth, checkUser };