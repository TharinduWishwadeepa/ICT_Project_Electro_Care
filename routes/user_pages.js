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
        console.log(error);
      } else {
        //generate chart
        customerTasks.getUsage(account_no, (error, usage)=>{
          let no_of_units = [];
          let date_of_bill = [];
          if(!error || usage.length != 0){
            //push to arrays
            for(var i=0; i < usage.length; i++){
              no_of_units.push(usage[i].no_of_units); 
              let full_date = usage[i].date_of_bill;
              let month = full_date.toLocaleString('default', { month: 'short' });
              date_of_bill.push(month);
            }
            //reverse array
            no_of_units = no_of_units.reverse();
            date_of_bill = date_of_bill.reverse();

            //render
            res.render("index", { results, no_of_units, date_of_bill });
          }
          else if(!error || usage.length == 0){
            res.render("index", { results, no_of_units, date_of_bill });
          }
          else{
            console.log(error);
          }
        })       
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
        res.render("upload_image")
      }
      else if(bill == "have_bill"){ 
        res.render("upload_image",{alert:"info",
        alertTitle:"Info",
        text:"You have submitted the meter Reading for this month",
        link:"/",
        buttonType:"btn-success",
        buttonTxt:"Go To Home Page"
      });
      }
    })
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

router.get('/view_complain', authController.isLoggedIn, (req, res) => {
  if (req.user) {
    res.locals.title = "View Complain";
    customerTasks.viewComplain(req,res);
} else {
    res.redirect("/");
  }
});

router.get('/notifications', authController.isLoggedIn, (req, res) => {
  if (req.user) {
    res.locals.title = "Notifications";
    customerTasks.viewNotifications(req,res);
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
