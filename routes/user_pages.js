const express = require("express");
const router = express.Router();
const authController = require("../controllers/user_auth_control");
const customerTasks = require("../controllers/customer_tasks");

router.get("/", authController.isLoggedIn, (req, res) => {
  if (req.user) {
    res.locals.title = "Welcome";
    //Get the balance of the user to display in index
    let account_no = customerTasks.getAccountNo(req, res);
    customerTasks.getCustomerData(account_no, (error, results) => {
      if (error) {
        console.log("eroor");
      } else {
        res.render("index", { results });
      }
    });
  } else {
    res.redirect("/login");
  }
});

router.get("/register", authController.isLoggedIn, (req, res) => {
  if (req.user) {
    res.redirect("/");
  } else {
    res.locals.title = "Customer Register";
    res.render("register");
  }
});

router.get("/login", authController.isLoggedIn, (req, res) => {
  if (req.user) {
    res.redirect("/");
  } else {
    res.locals.title = "Customer Login";
    res.render("login");
  }
});

router.get("/edit_user", authController.isLoggedIn, (req, res) => {
  if (req.user) {
    res.locals.title = "Edit";
    customerTasks.editUser(req, res);
  } else {
    res.redirect("/");
  }
});

router.get("/make_complain", authController.isLoggedIn, (req, res) => {
  if (req.user) {
    res.locals.title = "Make Complain";
    res.render("make_complain");
} else {
    res.redirect("/");
  }
});

router.get("/change_password", authController.isLoggedIn, (req, res) => {
  if (req.user) {
    res.locals.title = "Change Password";
    res.render("change_password");
} else {
    res.redirect("/");
  }
});

router.get("/upload_image", authController.isLoggedIn, (req, res) => {
  if (req.user) {
    let account_no = customerTasks.getAccountNo(req, res);
    res.locals.title = "Upload Meter Reading";
    customerTasks.checkBillThisMonth(account_no,(error,bill)=>{
      if(bill == "no_bill"){
        res.render("upload_image",{messageWarning:
          "There is no bill for this month. Please submit the meter reading for this month",})
      }
      else if(bill == "have_bill"){ 
        res.render("upload_image",{alert:"info",alertTitle:"Info"});
      }
    })
    //res.render("upload_image");
} else {
    res.redirect("/");
  }
});

router.get('/view_bill', authController.isLoggedIn, (req, res) => {
  if (req.user) {
    res.locals.title = "View Bill";
    customerTasks.viewBill(req,res);
} else {
    res.redirect("/");
  }
});

router.get('/view_maintenances', authController.isLoggedIn, (req, res) => {
  if (req.user) {
    res.locals.title = "View Maintenances";
    customerTasks.viewMaintenances(req,res);
} else {
    res.redirect("/");
  }
});

router.post("/update_user", customerTasks.updateUser);
router.post("/make_complain", customerTasks.makeComplain);
router.post('/change_password', customerTasks.changePW);
router.post('/upload_image', customerTasks.uploadImage);
router.post('/confirm_reading', customerTasks.generateBill);

module.exports = router;
