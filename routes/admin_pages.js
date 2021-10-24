const express = require('express');
const router = express.Router();
const authController = require('../controllers/admin_auth_control');
const customerManage = require('../controllers/customer_management');

router.get('/', authController.isLoggedIn, (req, res) => {
    if(req.user) {
        res.locals.title = "Welcome Admin";
        res.render('./admin/index');
    } else {
        res.redirect('./admin/login');
    }  
  });

router.get('/login', authController.isLoggedIn, (req, res) => {
    if(req.user ) {
        res.redirect('./admin/index');
    } else {
        res.locals.title = "Admin Login";
        res.render('./admin/login');
    }
});
router.get('/customers', authController.isLoggedIn, (req, res) => {
    if(req.user) {
        res.locals.title = "Customer Management";
        customerManage.viewAll(req,res);
    } else {
        res.redirect('./admin/login');
    }
});

router.get('/viewcustomer/:id', authController.isLoggedIn, (req,res)=>{
    if(req.user){
        customerManage.view(req,res);
    }
    else {
        res.redirect('../login');
    }
});

router.get('/customers/unregistered',authController.isLoggedIn, (req, res) => {
    if(req.user){
        customerManage.viewUnregistered(req,res);
    }
    else {
        res.redirect('../login');
    }
}  );

module.exports = router;