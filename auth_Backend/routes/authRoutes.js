const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken'); 
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');


router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', verifyToken, authController.getProfile);


router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account'
}));


router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  const token = jwt.sign({ id: req.user.id, email: req.user.email }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
  res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);
});

module.exports = router;
