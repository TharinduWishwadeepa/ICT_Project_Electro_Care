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

module.exports = router;