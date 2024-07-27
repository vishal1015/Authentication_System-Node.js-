
const mongoose = require("mongoose");
const {isEmail}=require('validator');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "please entern an email"],
      unique: true,
      lowercase: true,
      validate: [isEmail, "please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "please entern an email"],
      minlength: [6, "min password leanght 6 char"],
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

//fire a functoin after doc saved to db
userSchema.post('save', function(doc,next){
  console.log('new user was created and saved',doc);
  next();
})

// fire a function before doc saved 
userSchema.pre('save', async function(next){
  // console.log('user about to be create & saved ', this)
  //passowrd hashing
  const salt = await bcrypt.genSalt();
  this.password= await bcrypt.hash(this.password,salt)
  next();

})


// static method to login user 
userSchema.statics.login = async function (email,password){
  const user = await this.findOne({email: email})
  if(user){
    const auth = await  bcrypt.compare(password, user.password);
    if(auth){
      return user ;
    }
    throw Error('incorrect password')
  }
  throw Error('incorrect email')
}
const User = mongoose.model("User", userSchema);

module.exports = User;