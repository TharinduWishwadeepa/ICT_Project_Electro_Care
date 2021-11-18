const db = require("../model/db");
const bcrypt = require("bcryptjs");

//get account_no of logged in user
exports.getAreaID = (req, res) => {
  try {
    const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
    return decoded.id;
  } catch (error) {
    console.log(error);
  }
};

//view all customers
exports.viewAllCustomers = (req, res) => {
    try {
      let areaid = this.getAreaID(req,res);
      db.start.query("SELECT * FROM customer WHERE area_id = ?",
      [areaid], (error, results) => {
        if (!error) {
          res.render("./area_office/customers", { customersData: results });
        } else {
          console.log(error);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  //view unregistered customers
exports.viewUnregisteredCustomer = (req, res) => {
  try {
    let areaid = this.getAreaID(req,res);
    db.start.query(
      "SELECT * FROM customer WHERE username = '' AND password = '' AND area_id = ?",
      [areaid], (error, results) => {
        if (!error) {
          res.render("./area_office/customers", { customersData: results });
        } else {
          console.log(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//search customer
exports.searchCustomer = (req, res) => {
  const searchTerm = req.body.search;
  try {
    db.start.query(
      "SELECT * FROM customer WHERE account_no LIKE ? OR name LIKE ?",
      ["%" + searchTerm + "%", "%" + searchTerm + "%"],
      (error, results) => {
        if (!error) {
          res.render("./area_office/customers", { customersData: results });
        } else {
          console.log(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};