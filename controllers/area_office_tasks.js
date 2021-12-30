const db = require("../model/db");
const bcrypt = require("bcryptjs");
const notify = require("./notifications");
const jwt = require("jsonwebtoken");

//get area_id of area office
exports.getAreaID = (req, res) => {
  try {
    const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
    return decoded.id;
  } catch (error) {
    console.log(error);
  }
};

//change password of area office - please check
exports.changePW = (req, res) => {
  let { current_pw, new_pw, confirm_pw } = req.body;

  let areaid = this.getAreaID(req, res);
  try {
    if (!current_pw || !new_pw || !confirm_pw) {
      return res.status(400).render("./area_office/change_password", {
        messageWarning: "Please provide required details",
        title: "Change Password",
      });
    }
    if (new_pw != confirm_pw) {
      return res.status(400).render("./area_office/change_password", {
        messageWarning: "New Passwords do not match",
        title: "Change Password",
      });
    }
    db.start.query(
      "SELECT password FROM areaoffice WHERE area_id = ?",
      [areaid],
      async (error, results) => {
        if (!error) {
          if (!(await bcrypt.compare(current_pw, results[0].password))) {
            return res.status(400).render("./area_office/change_password", {
              messageWarning: "Current Password is incorrect",
              title: "Change Password",
            });
          } else {
            let hashedPW = await bcrypt.hash(new_pw, 10);
            db.start.query(
              "UPDATE areaoffice SET password =? WHERE area_id = ?",
              [hashedPW, areaid],
              (error, results) => {
                if (!error) {
                  return res
                    .status(200)
                    .render("./area_office/change_password", {
                      message: "Password Updated",
                      title: "Change Password",
                    });
                }
              }
            );
          }
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//view all customers
exports.viewAllCustomers = (req, res) => {
  try {
    let areaid = this.getAreaID(req, res);
    db.start.query(
      "SELECT * FROM customer WHERE area_id = ?",
      [areaid],
      (error, results) => {
        if (!error) {
          res.render("./area_office", { customersData: results });
        } else {
          console.log(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//view unregistered customers
exports.viewUnregisteredCustomer = (req, res) => {
  try {
    let areaid = this.getAreaID(req, res);
    db.start.query(
      "SELECT * FROM customer WHERE username = '' AND password = '' AND area_id = ?",
      [areaid],
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

//search customer
exports.searchCustomer = (req, res) => {
  const searchTerm = req.body.search;
  try {
    let areaid = this.getAreaID(req, res);
    db.start.query(
      "SELECT * FROM customer WHERE account_no LIKE ? OR name LIKE ? AND area_id = ?",
      ["%" + searchTerm + "%", "%" + searchTerm + "%", areaid],
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

//Schedule a maintenance
exports.createMaintenance = (req, res) => {
  let { date, description } = req.body;
  let areaID = this.getAreaID(req, res);
  try {
    db.start.query(
      "INSERT INTO maintenance",
      [
        {
          area_id: areaID,
          date: date,
          description: description,
        },
      ],
      (error, results) => {
        if (!error) {
          let notification = {
            type: "Maintenance",
            title: "Maintenance is schedulded!",
            description: "Area Office is schedulded a Maintenance in your area. Click on the notification for more details",
            notification_to: areaID,
            notification_from: areaID,
            link: "/view_maintenances",
          }
          notify.makeNotification(notification,(error,results)=>{
            if(results == "success"){
              console.log("successfully schedulded Maintenance");
            }
            else{
              console.log(error);
            }
          })
        }
        else{
          console.log(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//get complains
exports.getComplaints = (req,res)=>{
  let areaID = this.getAreaID(req, res);
  try {
    db.start.query("SELECT * FROM complain WHERE area_id = ? ORDER BY datetime DESC",
    [areaID],(error,results)=>{
      if(results.length > 0){
        return res.render("./area_office/complaints",{results});
      }
      else if(results.length == 0){
        console.log("No complaints to show");
      }
    })
  } catch (error) {
    
  }
}

//reply to a complain
exports.replyComplaint = (req,res)=>{

}