const { Router } = require('express')
const authController = require('../Controller/authController')

const router = Router();

// router.get('/signup', () =>{});
router.get('/signup', authController.signup_get);
router.post("/signup", authController.signup_post);
router.get("/login", authController.login_get);
router.post("/login", authController.login_post);
router.get("/logout", authController.logout_get);
router.post("/reset-password/:token", authController.resetPassword_post);
router.post("/forgot-password", authController.forgot_pass_post);
router.get('/forgot-password', authController.forgot_pass_get);
module.exports = router;
    