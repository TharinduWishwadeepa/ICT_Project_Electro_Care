const express = require('express');
const router = express.Router();
const authController = require('../controllers/admin_auth_control');
const adminTasks = require('../controllers/admin_tasks');

//gets
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
        adminTasks.viewAllCustomers(req,res);
    } else {
        res.redirect('./login');
    }
});

router.get('/viewcustomer/:id', authController.isLoggedIn, (req,res)=>{
    if(req.user){
        adminTasks.viewCustomer(req,res);
    }
    else {
        res.redirect('../login');
    }
});

router.get('/customers/unregistered',authController.isLoggedIn, (req, res) => {
    if(req.user){
        res.locals.title = "Unregistered Customers";
        adminTasks.viewUnregisteredCustomer(req,res);
    }
    else {
        res.redirect('../login');
    }
});

router.get('/pricings',authController.isLoggedIn,(req,res)=>{
    if(req.user){
        res.locals.title = "Electricity Pricings";
        adminTasks.viewAllPricings(req,res);
    }
    else {
        res.redirect('./login');
    }
});

router.get('/add_pricing', authController.isLoggedIn,(req,res)=>{
    if(req.user){
        res.locals.title = "Add Pricing";
        res.render('./admin/add_pricing');
    }
    else {
        res.redirect('./login');
    }
});

router.get('/edit_pricing/:id',authController.isLoggedIn,(req,res)=>{
    if(req.user){
        res.locals.title = "Edit Pricing";
        adminTasks.editPricing(req,res);
    }
    else {
        res.redirect('../login');
    }
});

router.get('/add_areaoffice',authController.isLoggedIn,(req,res)=>{
    if(req.user){
        res.locals.title = "Add Area Office";
        res.render('./admin/add_areaoffice');
    }
    else {
        res.redirect('./login');
    }
});

//posts
router.post('/add_areaoffice',adminTasks.addAreaOffice);
router.post('/update_pricing',adminTasks.updatePricing);
router.post('/add_pricing',adminTasks.addPricing);

module.exports = router;