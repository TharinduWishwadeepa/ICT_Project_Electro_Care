const express = require('express');
const router = express.Router();
const authController = require('../controllers/admin_auth_control');
const adminTasks = require('../controllers/admin_tasks');

//gets
router.get('/', authController.isLoggedIn, (req, res) => {
    if(req.user) {
        res.locals.title = "Welcome Admin";
        adminTasks.viewAllCustomers(req,res);
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

router.get('/add_customer', authController.isLoggedIn, (req,res)=>{
    if(req.user){
        res.locals.title="Add a Customer";
        adminTasks.renderAddCustomer(req,res);
    }
    else {
        res.redirect('../login');
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

router.get('/editcustomer/:id', authController.isLoggedIn, (req,res)=>{
    if(req.user){
        adminTasks.editCustomer(req,res);
    }
    else {
        res.redirect('../login');
    }
});

router.get('/registered',authController.isLoggedIn, (req, res) => {
    if(req.user){
        res.locals.title = "Registered Customers";
        adminTasks.viewRegisteredCustomers(req,res);
    }
    else {
        res.redirect('../login');
    }
});

router.get('/unregistered',authController.isLoggedIn, (req, res) => {
    if(req.user){
        res.locals.title = "Unregistered Customers";
        adminTasks.viewUnregisteredCustomer(req,res);
    }
    else {
        res.redirect('../login');
    }
});

router.get('/area_offices',authController.isLoggedIn, (req, res) =>{
    if(req.user){
        res.locals.title = "Area Offices";
        adminTasks.viewAllAreaOffices(req,res);
    }
    else {
        res.redirect('../login');
    }
})

router.get('/pricings',authController.isLoggedIn, (req,res)=>{
    if(req.user){
        res.locals.title = "Electricity Pricings";
        adminTasks.viewAllPricings(req,res);
    }
    else {
        res.redirect('./login');
    }
});

router.get('/add_pricing', authController.isLoggedIn, (req,res)=>{
    if(req.user){
        res.locals.title = "Add Pricing";
        res.render('./admin/add_pricing');
    }
    else {
        res.redirect('./login');
    }
});

router.get('/edit_pricing/:id',authController.isLoggedIn, (req,res)=>{
    if(req.user){
        res.locals.title = "Edit Pricing";
        adminTasks.editPricing(req,res);
    }
    else {
        res.redirect('../login');
    }
});

router.get('/add_areaoffice',authController.isLoggedIn, (req,res)=>{
    if(req.user){
        res.locals.title = "Add Area Office";
        res.render('./admin/add_areaoffice');
    }
    else {
        res.redirect('./login');
    }
});

router.get('/meter_readers',authController.isLoggedIn, (req,res)=>{
    if(req.user){
        res.locals.title = "Meter Readers";
        adminTasks.viewAllMeterReaders(req,res);
    }
    else {
        res.redirect('../login');
    }
});

router.get('/complaints', authController.isLoggedIn,(req,res)=>{
    if(req.user){
        res.locals.title = "Complaints";
        adminTasks.viewComplaints(req,res);
    }
    else {
        res.redirect('../login');
    }
});

router.get("/change_password", authController.isLoggedIn, (req, res) => {
    if (req.user) {
      res.locals.title = "Change Password";
      res.render("admin/change_password");
  } else {
      res.redirect("/admin");
    }
  });

//searches
router.get('/search_customers',adminTasks.searchCustomer);
router.get('/search_meter_readers', adminTasks.searchMeterReader);
router.get('/search_area_offices', adminTasks.searchAreaOffice);

//posts
router.post('/add_areaoffice', adminTasks.addAreaOffice);
router.post('/update_pricing', adminTasks.updatePricing);
router.post('/add_pricing', adminTasks.addPricing);

module.exports = router;