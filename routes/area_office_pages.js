const express = require("express");
const router = express.Router();
const authController = require("../controllers/areaoffice_auth_control");
const officerTasks = require("../controllers/area_office_tasks");

//gets
router.get('/', authController.isLoggedIn, (req, res) => {
    if(req.user) {
        res.locals.title = "Welcome";
        officerTasks.viewAllCustomers(req,res);
    } else {
        res.redirect('./area_office/login');
    }  
});

router.get('/login', authController.isLoggedIn, (req, res) => {
    if(req.user ) {
        res.redirect('../area_office');
    } else {
        res.locals.title = "Area Office Login";
        res.render('./area_office/login');
    }
});

router.get("/change_password", authController.isLoggedIn, (req, res) => {
    if (req.user) {
      res.locals.title = "Change Password";
      res.render("area_office/change_password");
  } else {
      res.redirect("/area_office");
    }
});

router.get("/maintenance", authController.isLoggedIn, (req, res) => {
    if (req.user) {
      res.locals.title = "Maintenance";
      officerTasks.viewMaintenences(req,res);
  } else {
      res.redirect("/area_office");
    }
});

router.get('/complaints', authController.isLoggedIn,(req,res)=>{
    if(req.user){
        res.locals.title = "Complaints";
        officerTasks.viewComplaints(req,res);
    }
    else {
        res.redirect('../area_office');
    }
});

router.get('/view_complaint/:comp_id', authController.isLoggedIn,(req,res)=>{
    if(req.user){
        res.locals.title = "Complaint";
        officerTasks.viewComplain(req,res);
    }
    else {
        res.redirect('../area_office');
    }
});

router.get('/registered',authController.isLoggedIn, (req, res) => {
    if(req.user){
        res.locals.title = "Registered Customers";
        officerTasks.viewRegisteredCustomers(req,res);
    }
    else {
        res.redirect('../area_office');
    }
});

router.get('/unregistered',authController.isLoggedIn, (req, res) => {
    if(req.user){
        res.locals.title = "Unregistered Customers";
        officerTasks.viewUnregisteredCustomer(req,res);
    }
    else {
        res.redirect('../area_office');
    }
});
router.get('/search_customers',officerTasks.searchCustomer);

router.post('/reply_complaint',officerTasks.replyComplaint);
router.post('/change_password',officerTasks.changePW)
router.post('/new_maintenance',officerTasks.createMaintenance)
module.exports = router;