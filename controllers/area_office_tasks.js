const db = require("../model/db");
const bcrypt = require("bcryptjs");
const notify = require("./notifications");
const jwt = require("jsonwebtoken");
const { x } = require("pdfkit");
const e = require("express");

//get area_id of area office
exports.getAreaID = (req, res) => {
  try {
    const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
    return decoded.id;
  } catch (error) {
    console.log(error);
  }
};

exports.getCustomerData = (account_no, callback) => {
  try {
    db.start.query(
      "SELECT account_no, name, area_id, balance, tariff, current_reading,username FROM customer WHERE account_no = ?",
      [account_no],
      (error, results) => {
        if (!error) {
          return callback(null, results);
        } else {
          return callback(error, null);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//change password of area office
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
          res.render("./area_office", {
            customersData: results,
            heading: "All Customers",
          });
        } else {
          console.log(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//view registered customers
exports.viewRegisteredCustomers = (req, res) => {
  let areaid = this.getAreaID(req, res);
  try {
    db.start.query(
      "SELECT * FROM customer WHERE username != '' AND password != '' AND area_id = ? ",[areaid],
      (error, results) => {
        if (!error) {
          res.render("./area_office", {
            customersData: results,
            heading: "Registered Customers",
          });
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
          res.render("./area_office", {
            customersData: results,
            heading: "Unregistered Customers",
          });
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
  const searchTerm = req.query.search;
  try {
    let areaid = this.getAreaID(req, res);
    db.start.query(
      "SELECT * FROM customer WHERE (account_no LIKE ? OR name LIKE ?) AND area_id = ?",
      ["%" + searchTerm + "%", "%" + searchTerm + "%", areaid],
      (error, results) => {
        if (!error) {
          res.render("./area_office", {
            customersData: results,
            heading: `Search results: "${req.query.search}"`,
            searchTerm: req.query.search,
          });
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
      "INSERT INTO maintenance SET ?",
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
            description:
              "Area Office is schedulded a Maintenance in your area. Click on the notification for more details",
            notification_to: areaID,
            notification_from: areaID,
            link: "/view_maintenances",
          };
          notify.makeNotification(notification, (error, results) => {
            if (results == "success") {
              res.redirect('/area_office/maintenance');
            } else {
              console.log(error);
            }
          });
        } else {
          console.log(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//view Maintenences
exports.viewMaintenences = (req,res)=>{
  let areaid = this.getAreaID(req, res);
  try {
    db.start.query("SELECT * FROM maintenance WHERE area_id = ? ORDER BY date DESC ",[areaid],(error,results)=>{
      if(!error){
        return res.render('area_office/maintenance',{results});
      }
      else{
        console.log(error);
      }
    })
  } catch (error) {
    console.log(error);
  }
}
//get complaints page
exports.viewComplaints = (req, res) => {
  let areaID = this.getAreaID(req, res);
  try {
    //
    //select complaint records
    db.start.query(
      "SELECT * FROM complain WHERE complain_to = ?",
      [areaID],
      (error, results) => {
        if (!error) {
          //count of all complaints ---
          db.start.query(
            "SELECT COUNT(complain_id) AS countAll FROM complain WHERE complain_to = ?",
            [areaID],
            (error, countAll) => {
              if (!error) {
                //count of new complaints  ---
                db.start.query(
                  "SELECT COUNT(complain_id) AS countNew FROM complain WHERE status = 'Pending' AND complain_to = ?",
                  [areaID],
                  (error, countNew) => {
                    if (!error) {
                      //count of in progress ---
                      db.start.query(
                        "SELECT COUNT(complain_id) AS countInProgress FROM complain WHERE status = 'In Progress' AND complain_to = ?",
                        [areaID],
                        (error, countInProgress) => {
                          if (!error) {
                            //count of completed ---
                            db.start.query(
                              "SELECT COUNT(complain_id) AS countCompleted FROM complain WHERE status = 'Completed' AND complain_to = ?",
                              [areaID],
                              (error, countCompleted) => {
                                if (!error) {
                                  return res.render(
                                    "./area_office/complaints",
                                    {
                                      Complains: results,
                                      countAll: countAll[0].countAll,
                                      countNew: countNew[0].countNew,
                                      countInProgress:
                                        countInProgress[0].countInProgress,
                                      countCompleted:
                                        countCompleted[0].countCompleted,
                                    }
                                  );
                                } else {
                                  console.log(error);
                                }
                              }
                            );
                          } else {
                            console.log(error);
                          }
                        }
                      );
                    } else {
                      console.log(error);
                    }
                  }
                );
              } else {
                console.log(error);
              }
            }
          );
        } else {
          console.log(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//get single complain
exports.viewComplain = (req, res) => {
  try {
    db.start.query(
      "SELECT * FROM complain INNER JOIN customer ON complain.account_no = customer.account_no WHERE complain_id = ?",
      [req.params.comp_id],
      (error, results) => {
        if (!error) {
          return res.render("area_office/view_complaint", { results });
        } else {
          console.log(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//reply to a complain
exports.replyComplaint = (req, res) => {
  let { account_no, complain_id, status, reply } = req.body;
  try {
    db.start.query(
      "UPDATE complain SET ? WHERE complain_id = ?",
      [
        {
          status: status,
          reply: reply,
        },
        complain_id,
      ],
      (error, results) => {
        if (!error) {
          let notification = {
            type: "Complain",
            title: `The status of the complain id : ${complain_id} has been changed to ${status}`,
            description: `${reply}`,
            notification_to: account_no,
            notification_from: "Area Office",
            link: "#",
          };
         notify.makeNotification(notification, (error, results)=>{
          if (results == "success") {
            db.start.query(
              "SELECT * FROM complain INNER JOIN customer ON complain.account_no = customer.account_no WHERE complain_id = ?",
              [complain_id],
              (error, results) => {
                if (!error) {
                  return res.render("area_office/view_complaint", { results });
                } else {
                  console.log(error);
                }
              }
            );
          } else {
            console.log(error);
          }
         })

          ///
          
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};
