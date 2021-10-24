const express = require('express');
const router = express.Router();
const authController = require('../controllers/user_auth_control');

router.get('/', authController.isLoggedIn, (req, res) => {
    if(req.user ) {
        res.locals.title = "Welcome";
        res.render('index');

    } else {
        res.redirect('/login');
    }  
  });

router.get('/register', authController.isLoggedIn, (req, res) => {
    if(req.user ) {
        res.redirect("/");
    } else {
        res.locals.title = "Customer Register";
        res.render('register');
    }   
});

router.get('/login', authController.isLoggedIn, (req, res) => {
    if(req.user) {
        res.redirect("/");
    } else {
        res.locals.title = "Customer Login";
        res.render('login');
        
    }
});


module.exports = router;