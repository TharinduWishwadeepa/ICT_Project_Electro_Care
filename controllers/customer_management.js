const db = require("../model/db");

//view all customers
exports.viewAll = (req, res) => {
  try {
    db.start.query("SELECT * FROM customer", (error, results) => {
      if (!error) {
        res.render("./admin/customers", { customersData: results });
      } else {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//view details of one customer
exports.view = (req,res)=>{
  try {
    db.start.query("SELECT * FROM customer WHERE account_no=?",[req.params.id], (error, results) => {
      if (!error) {
        console.log(results);
        res.render("./admin/viewcustomer",{customerData: results});
      } else {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
}

//view unregistered customers
exports.viewUnregistered = (req, res) => {
  try {
    db.start.query(
      "SELECT * FROM customer where username = '' AND password=''",
      (error, results) => {
        console.log(results);
        if (!error) {
          res.render("admin/customers", { customersData: results });
        } else {
          console.log(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};
