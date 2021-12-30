const db = require("../model/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const notify = require('./notifications');
var cloudinary = require("cloudinary").v2;
const PDFDocument = require('pdfkit');

//cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

//get account_no of logged in user
exports.getAccountNo = (req, res) => {
  try {
    const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
    return decoded.id;
  } catch (error) {
    console.log(error);
  }
};

//get user details
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

exports.viewNotifications = (req, res) => {
  let account_no = this.getAccountNo(req, res);
  try {
    db.start.query(
      "SELECT * FROM notification WHERE notification_to = ? OR notification_to = 'Everyone' ORDER BY timestamp DESC",
      [account_no], 
      (error, results) => {
        if (results.length == 0) {
          console.log("no notifications");
          return res.render("notifications", {
            Message: "No notifications to show.",
          });
        } else if (results.length >= 1) {
          return res.render("notifications", { notification: results });
        } else if (error) {
          console.log("error", error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//make complain
exports.makeComplain = (req, res) => {
  let { complain_to, type, description } = req.body;
  let account_no = this.getAccountNo(req, res);
  if (!type || type == "Select Complain type" || !description) {
    return res.status(400).render("make_complain", {
      messageWarning: "Please provide required details",
      title: "Make Complain",
    });
  }
  this.getCustomerData(account_no, (error, results) => {
    let area_id = results[0].area_id;
    let comp_to;
    if(complain_to =="area_office"){
      comp_to = area_id;
    }
    else if(complain_to =="admin"){
      comp_to = "admin";
    }
    try {
      db.start.query(
        "INSERT INTO complain SET ?",
        [
          {
            type: type,
            description: description,
            account_no: account_no,
            complain_to: comp_to,
            status: "Pending",
          },
        ],
        (error, results) => {
          if (!error) {
            try {
              //notification
              let notification = {
                type: "Complain",
                title: "Customer Complain",
                description: `${account_no} has made a complain`,
                notification_to: comp_to,
                notification_from: account_no,
                link: results.insertId,
              };
              notify.makeNotification(notification, (error, results) => {
                if (results == "success") {
                  return res.render("make_complain", {
                    title: "Make Complain",
                    alert: "alert",
                    alertTitle: "Complain Added Successfully!",
                  });
                } else {
                  console.log(error);
                }
              });
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
  });
};

//view complaints
exports.viewComplain = (req, res) => {
  try {
    let account_no = this.getAccountNo(req, res);
    db.start.query(
      "SELECT * FROM complain WHERE status = 'pending' AND account_no = ? ORDER BY datetime DESC ",
      [account_no],
      (error, results) => {
        if (!error) {
          return res.render("complaints", { results });
        } else {
          console.log(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//get pricings
exports.getPricing = (tariff, callback) => {
  try {
    db.start.query(
      "SELECT * FROM pricing WHERE tariff = ? ",
      [tariff.trim()],
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
              "UPDATE customer SET password =? WHERE account_no = ?",
              [hashedPW, account_no],
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

//Nanonets OCR API - get meter reading
exports.getOCR = (urlimg, callback) => {
  var request = require("request");
  var querystring = require("querystring");
  const form_data = { urls: [urlimg] };
  const options = {
    url: "https://app.nanonets.com/api/v2/OCR/Model/8c1dfbf1-1e5c-4a34-87c7-f99d6b200034/LabelUrls/",
    body: querystring.stringify(form_data),
    headers: {
      Authorization:
        "Basic " +
        Buffer.from("mbVSBBs6tQB8S-AEbDrd7NS0zkad2N9Q" + ":").toString(
          "base64"
        ),
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
  request.post(options, function (err, httpResponse, body) {
    if (!err) {
      return callback(null, body);
    } else {
      return callback(err, null);
    }
  });
};

//upload image and get OCR result, analyze the reading before confirm
exports.uploadImage = (req, res, next) => {
  var file;
  if (!req.files) {
    console.log("File was not found");
  }

  file = req.files.photo; //get the image from form
  var url;
  cloudinary.uploader.upload(file.tempFilePath, (error, results) => {
    //upload the image
    if (!error) {
      url = results.secure_url; // get URL of uploaded image

      this.getOCR(url, (err, body) => {
        //send URL to Nanonets OCR API
        if (err) {
          console.log(error);
        } else {
          let resultObj = JSON.parse(body); //get the JSON Result of OCR

          if (!resultObj.result) {
            // if there is no result
            res.render("upload_image", {
              alert:"error",
              alertTitle:"Ooops !",
              title: "Upload Meter Reading",
              text:"Cannot get the Reading. Please Try Again !",
              link:"/upload_image",
              buttonType:"btn-secondary",
              buttonTxt:"Try Again"
            });
          } else {
            // if there is a result
            let meterReading = resultObj.result[0].prediction[0].ocr_text; //get original result
            let account_no = this.getAccountNo(req, res); //get account_no
            let current_reading;
            let balance;
            this.getCustomerData(account_no, (error, results) => {
              if (error) {
                console.log(error);
              } else {
                current_reading = results[0].current_reading; //get current reading
                balance = results[0].balance; // get balance
                customername = results[0].name; //get name
              }
            });
            meterReadingFormatted = meterReading.slice(0, 5); // get 1st 5 digits from meterReading
            //if the reading length is less than 5
            if (meterReading.length < 5) {
              res.render("upload_image", {
                alert:"error",
                alertTitle:"Ooops !",
                title: "Upload Meter Reading",
                text:"Invalid Meter Reading. Please Try Again !",
                link:"/upload_image",
                buttonType:"btn-secondary",
                buttonTxt:"Try Again",
                title: "Upload Meter Reading",
              });
            }
            //if meter reading is less than current_reading
            else if (meterReadingFormatted <= current_reading) {
              res.render("upload_image", {
                alert:"error",
                alertTitle:"Ooops !",
                title: "Upload Meter Reading",
                text:"Invalid Meter Reading. Please Try Again !",
                link:"/upload_image",
                buttonType:"btn-secondary",
                buttonTxt:"Try Again",
                title: "Upload Meter Reading",
              });
            } else {
              //if no problem with the reading
              this.getCustomerData(account_no, (error, results) => {
                if (!error) {
                  let tariff = results[0].tariff;
                  res.render("confirm_reading", {
                    meterReadingFormatted,
                    tariff,
                    current_reading,
                    account_no,
                    balance,
                    url,
                    customername,
                    title: "Confirm Meter Reading",
                  });
                }
              });
            }
          }
        }
      });
    } else {
      console.log(error);
    }
  });
};

//check if there is a bill for current month
exports.checkBillThisMonth = (account_no, callback) => {
  try {
    db.start.query(
      "SELECT * FROM bill WHERE acc_no = ? AND ( MONTH(date_of_bill) = MONTH(CURRENT_DATE()) AND YEAR(date_of_bill) = YEAR(CURRENT_DATE()) )",
      [account_no],
      (error, results) => {
        let bill;
        if (results.length == 0) {
          // if there is no bill
          bill = "no_bill";
          return callback(null, bill);
        } else if (results.length == 1) {
          bill = "have_bill";
          return callback(null, bill);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//get the bill of current month
exports.billThisMonth = (req,res) => {
  try {
    let account_no = this.getAccountNo(req, res);
    db.start.query(
      "SELECT * FROM bill WHERE acc_no = ? AND ( MONTH(date_of_bill) = MONTH(CURRENT_DATE()) AND YEAR(date_of_bill) = YEAR(CURRENT_DATE()) )",
      [account_no],
      (error, bill_results) => {
        if (bill_results.length == 0) {
          console.log(error)
        } else if (bill_results.length == 1) {
          this.getCustomerData(account_no,(error,customerData)=>{
            if(!error){
              this.getPricing(customerData[0].tariff,(error,pricing)=>{ 
                if(!error){
                  return res.render("view_bill", {bill_results,customerData,pricing});
                }
                else{
                  console.log(error);
                }
              })  
            }
            else{
              console.log(error);
            }
          })
        }
      }
    );
  } catch (error) {}
};

//confirm and generate bill
exports.generateBill = (req, res) => {
  let {
    tariff,
    meter_reading,
    current_reading,
    url,
    balance,
    account_no,
    customername,
  } = req.body;
  account_no = account_no.trim();
  try {
    //get pricing
    this.getPricing(tariff, (error, results) => {
      try {
        if (error) {
          console.log(error);
        } else {
          //get price for units used
          let b1_30 = results[0].b1_30;
          let b31_60 = results[0].b31_60;
          let b61_90 = results[0].b61_90;
          let b91_105 = results[0].b91_105;
          let fixed_price = results[0].fixed_price;

          let no_of_units = meter_reading - current_reading;
          let total;
          if (no_of_units > 0 && no_of_units < 31) {
            total = b1_30 * no_of_units;
          } else if (no_of_units > 31 && no_of_units < 61) {
            let remainder = no_of_units - 30;
            total = b1_30 * 30 + b31_60 * remainder;
          } else if (no_of_units > 61 && no_of_units < 91) {
            let remainder = no_of_units - 60;
            total = b1_30 * 30 + b31_60 * 30 + b61_90 * remainder;
          } else if (no_of_units > 91 && no_of_units < 106) {
            let remainder = no_of_units - 90;
            total =
              b1_30 * 30 + b31_60 * 30 + b61_90 * 30 + b91_105 * remainder;
          }
          let cost_of_usage = total + parseFloat(fixed_price);
          payableAmount = cost_of_usage + parseFloat(balance);
          //add a bill
          db.start.query(
            "INSERT INTO bill SET ?",
            [
              {
                acc_no: account_no,
                reading: meter_reading,
                no_of_units: no_of_units,
                cost_of_usage: cost_of_usage,
                total_payable: payableAmount,
                image: url,
                markedby: "User",
              },
            ],
            (error, results) => {
              if (!error) {
                db.start.query(
                  "UPDATE customer SET ?",
                  [
                    {
                      balance: payableAmount,
                      current_reading: meter_reading,
                    },
                  ],
                  (error, results) => {
                    if (!error) {
                      return res.render("confirm_reading", {
                        alert: "alert",
                        alertTitle: "Success!",
                      });
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
        }
      } catch (error) {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//view bill
exports.viewBill = (req, res) => {
  try {
    let account_no = this.getAccountNo(req, res);
    //select bill of current month
    db.start.query("SELECT * FROM bill WHERE acc_no = ? AND bill_id = ?",
      [account_no, req.params.bill_id],
      (error, bill_results) => {
        if(bill_results.length > 0){
          this.getCustomerData(account_no,(error,customerData)=>{
            if(!error){
              this.getPricing(customerData[0].tariff,(error,pricing)=>{ 
                if(!error){
                  return res.render("view_bill", {bill_results,customerData,pricing});
                }
                else{
                  console.log(error);
                }
              })  
            }
            else{
              console.log(error);
            }
          })    
        } 
        else {
          res.render("index", {
            alert:"error",
            alertTitle:"Ooops !",
            title: "No Bill Available!",
            text:"No Bill Available for this month. Please Upload meter reading !",
            link:"/upload_image",
            buttonType:"btn-secondary",
            buttonTxt:"Upload Meter Reading"
          });
        }
      });
  } catch (error) {
    console.log(error);
  }
};

//view maintenances
exports.viewMaintenances = (req, res) => {
  try {
    let account_no = this.getAccountNo(req, res);
    this.getCustomerData(account_no, (error, results) => {
      if (!error) {
        let area_id = results[0].area_id;
        db.start.query(
          "SELECT * FROM maintenance WHERE area_id = ? AND (date >= DATE_ADD(NOW(), INTERVAL -2 MONTH))",
          [area_id],
          (error, results) => {
            if (!error) {
              return res.render("view_maintenances", { maintenances: results });
            } else {
              console.log(error);
            }
          }
        );
      } else {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//get usage
exports.getUsage = (account_no,callback)=>{
  try {
    db.start.query('SELECT no_of_units, date_of_bill FROM bill WHERE acc_no = ? ORDER BY date_of_bill DESC LIMIT 8',
    [account_no],(error,usage)=>{
      if(!error){
        return callback(null, usage);
      }
      else{
        return callback(error, null);
      }
    })
  } catch (error) {
    console.log(error);
  }

};

//bill history - get list of bills
exports.billHistory = (account_no,callback)=>{
  try {
    db.start.query('SELECT * FROM bill WHERE acc_no = ? ORDER BY date_of_bill DESC LIMIT 24',
    [account_no],(error,billHistory)=>{
      if(!error){
        return callback(null, billHistory);
      }
      else{
        return callback(error, null);
      }
    })
  } catch (error) {
    
  }
};
