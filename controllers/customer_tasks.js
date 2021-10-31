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
  //  let account_no = this.getAccountNo(req,res);
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
      title:'Edit',
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
                    title:'Edit',
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
  this.getAreaID(account_no,(error,results)=>{
      let area_id = results[0].area_id;
      try {
        db.start.query("INSERT INTO complain SET ?", [
            {
              type: type,
              description: description,
              account_no: account_no,
              area_id: area_id,
              status: "Pending",
            }],(error,results)=>{
                if(!error){
                    return res.render("make_complain", {
                        message: "Complain Added Successfully!",
                        title: "Make Complain",
                      });
                }
                else{
                    console.log(error);
                }
            })
      } catch (error) {
        console.log(error);
      }
  })
};
