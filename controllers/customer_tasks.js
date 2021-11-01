const db = require("../model/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//get account_no of logged in user
exports.getAccountNo = (req, res) => {
  try {
    const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
    return decoded.id;
  } catch (error) {
    console.log(error);
  }
};

//get area_id
exports.getAreaID = (account_no, callback) => {
  try {
    db.start.query(
      "SELECT area_id FROM customer WHERE account_no = ?",
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

//get balance
exports.getBalance = (account_no, callback) => {
  try {
    db.start.query(
      "SELECT balance from customer WHERE account_no = ?",
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

//edit user - Send the editing data to the form
exports.editUser = (req, res) => {
  try {
    let account_no = this.getAccountNo(req, res);
    db.start.query(
      "SELECT * FROM customer WHERE account_no = ?",
      [account_no],
      (error, results) => {
        if (!error) {
          res.render("edit_user", { results });
        } else {
          console.log(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//update user
exports.updateUser = (req, res) => {
  let account_no = this.getAccountNo(req, res);
  let { name, nic, address, email, mobile_no } = req.body;
  if (!name || !email || !address || !nic || !mobile_no) {
    return res.status(400).render("edit_user", {
      message: "Please provide required fields",
      title: "Edit",
    });
  }

  try {
    db.start.query(
      "UPDATE customer SET ? WHERE account_no = ?",
      [
        {
          name: name,
          nic: nic,
          address: address,
          email: email,
          mobile_no: mobile_no,
        },
        account_no,
      ],
      (error, results) => {
        if (!error) {
          try {
            let account_no = this.getAccountNo(req, res);
            db.start.query(
              "SELECT * FROM customer WHERE account_no = ?",
              [account_no],
              (error, results) => {
                if (!error) {
                  res.render("edit_user", {
                    results,
                    message: "User Updated Successfully!",
                    title: "Edit",
                  });
                } else {
                  res.status(400).render("edit_user", {
                    message: error,
                  });
                }
              }
            );
          } catch (error) {
            console.log(error);
          }
        } else {
          console.log(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//make complain
exports.makeComplain = (req, res) => {
  let { type, description } = req.body;
  let account_no = this.getAccountNo(req, res);
  if (!type || type == "Select Complain type" || !description) {
    return res.status(400).render("make_complain", {
      messageWarning: "Please provide required details",
      title: "Make Complain",
    });
  }
  this.getAreaID(account_no, (error, results) => {
    let area_id = results[0].area_id;
    try {
      db.start.query(
        "INSERT INTO complain SET ?",
        [
          {
            type: type,
            description: description,
            account_no: account_no,
            area_id: area_id,
            status: "Pending",
          },
        ],
        (error, results) => {
          if (!error) {
            return res.render("make_complain", {
              message: "Complain Added Successfully!",
              title: "Make Complain",
            });
          } else {
            console.log(error);
          }
        }
      );
    } catch (error) {
      console.log(error);
    }
  });
};

//change password
exports.changePW = (req, res) => {
  let { current_pw, new_pw, confirm_pw } = req.body;

  let account_no = this.getAccountNo(req, res);
  try {
    if (!current_pw || !new_pw || !confirm_pw) {
      return res.status(400).render("change_password", {
        messageWarning: "Please provide required details",
        title: "Change Password",
      });
    }
    if (new_pw != confirm_pw) {
      return res.status(400).render("change_password", {
        messageWarning: "New Passwords do not match",
        title: "Change Password",
      });
    }
    db.start.query(
      "SELECT password FROM customer WHERE account_no = ?",
      [account_no],
      async (error, results) => {
        if (!error) {
          if (!(await bcrypt.compare(current_pw, results[0].password))) {
            return res.status(400).render("change_password", {
              messageWarning: "Current Password is incorrect",
              title: "Change Password",
            });
          } else {
            let hashedPW = await bcrypt.hash(new_pw, 10);
            db.start.query(
              "UPDATE customer SET password =?",
              [hashedPW],
              (error, results) => {
                if (!error) {
                  return res.status(200).render("change_password", {
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

//upload image
exports.uploadImage = (req,res)=>{
  
}
