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

router.get('/add_area_office',authController.isLoggedIn, (req,res)=>{
    if(req.user){
        res.locals.title = "Add Area Office";
        res.render('./admin/add_area_office');
    }
    else {
        res.redirect('./login');
    }
});

router.get('/edit_area_office/:id',authController.isLoggedIn, (req,res)=>{
    if(req.user){
        res.locals.title = "Edit Area Office";
        adminTasks.editAreaOffice(req,res);
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

router.get('/add_meter_reader',authController.isLoggedIn, (req,res)=>{
    if(req.user){
        res.locals.title = "Meter Readers";
        adminTasks.renderAddReader(req,res);
    }
    else {
        res.redirect('../login');
    }
});

router.get('/edit_meter_reader/:id',authController.isLoggedIn, (req,res)=>{
    if(req.user){
        res.locals.title = "Edit Meter Reader";
        adminTasks.editMeterReader(req,res);
    }
    else {
        res.redirect('./login');
    }
});

router.get("/update_pw_meter_reader/:id", authController.isLoggedIn, (req, res) => {
    if (req.user) {
      res.locals.title = "Change Password";
      adminTasks.renderRestPWMR(req,res);
  } else {
      res.redirect("/admin");
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

router.get('/view_complaint/:comp_id', authController.isLoggedIn,(req,res)=>{
    if(req.user){
        res.locals.title = "Complaint";
        adminTasks.viewComplain(req,res);
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
router.post('/change_password',adminTasks.changePW);
router.post('/add_customer', adminTasks.addCustomer);
router.post('/add_areaoffice', adminTasks.addAreaOffice);
router.post('/update_customer',adminTasks.updateCustomer);
router.post('/update_pricing', adminTasks.updatePricing);
router.post('/add_pricing', adminTasks.addPricing);
router.post('/reply_complaint',adminTasks.replyComplaint);
router.post('/update_area_office',adminTasks.updateAreaOffice);
router.post('/update_pw_area_office',adminTasks.resetPWAreaOffice);
router.post('/update_pw_meter_reader',adminTasks.resetPWMeterReader);

module.exports = router;