const express = require("express");
const router = express.Router();
const authController = require("../controllers/user_auth_control");
const customerTasks = require("../controllers/customer_tasks");

router.get("/", authController.isLoggedIn, (req, res) => {
  if (req.user) {
    res.locals.title = "Welcome";
    //Get the balance of the user to display in index
    let account_no = customerTasks.getAccountNo(req, res);
    customerTasks.getBalance(account_no, (error, results) => {
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
router.post("/update_user", customerTasks.updateUser);
router.post("/make_complain", customerTasks.makeComplain);

module.exports = router;
