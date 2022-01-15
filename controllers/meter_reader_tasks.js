const db = require("../model/db");
const bcrypt = require("bcryptjs");
const customerTasks = require("./customer_tasks");
const jwt = require("jsonwebtoken");
var cloudinary = require("cloudinary").v2;

//cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

//get logged in reader id
exports.getMRID = (req, res) => {
  try {
    const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
    return decoded.id;
  } catch (error) {
    console.log(error);
  }
};

//get meter reader details
exports.getMeterReaderData = (mrid, callback) => {
  try {
    db.start.query(
      "SELECT * FROM meter_reader WHERE reader_id = ?",
      [mrid],
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

//change password of meter reader
exports.changePW = (req, res) => {
  let { current_pw, new_pw, confirm_pw } = req.body;

  let mrid = this.getMRID(req, res);
  try {
    if (!current_pw || !new_pw || !confirm_pw) {
      return res.status(400).render("./meter_reader/change_password", {
        messageWarning: "Please provide required details",
        title: "Change Password",
      });
    }
    if (new_pw != confirm_pw) {
      return res.status(400).render("./meter_reader/change_password", {
        messageWarning: "New Passwords do not match",
        title: "Change Password",
      });
    }
    db.start.query(
      "SELECT password FROM meter_reader WHERE reader_id = ?",
      [mrid],
      async (error, results) => {
        if (!error) {
          if (!(await bcrypt.compare(current_pw, results[0].password))) {
            return res.status(400).render("./meter_reader/change_password", {
              messageWarning: "Current Password is incorrect",
              title: "Change Password",
            });
          } else {
            let hashedPW = await bcrypt.hash(new_pw, 10);
            db.start.query(
              "UPDATE meter_reader SET password =? WHERE reader_id = ?",
              [hashedPW, mrid],
              (error, results) => {
                if (!error) {
                  return res
                    .status(200)
                    .render("./meter_reader/change_password", {
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

//search customer
exports.searchCustomer = (req, res) => {
  const searchTerm = req.body.search;
  try {
    let mrid = this.getMRID(req,res);
    this.getMeterReaderData(mrid,(error,results)=>{
      if(!error){
        let areaid = results[0].area_id;
        db.start.query(
          "SELECT * FROM customer WHERE (account_no LIKE ? OR name LIKE ? OR nic LIKE ?) AND area_id = ? AND username = ''",
          ["%" + searchTerm + "%", "%" + searchTerm + "%", "%" + searchTerm + "%", areaid],
          (error, results) => {
            if (!error) {
              res.render("./meter_reader", { customersData: results });
            } else {
              console.log(error);
            }
          }
        );
      }
      else{
        console.log(error);
      }
    })
    
  } catch (error) {
    console.log(error);
  }
};

//view unregistered customers
exports.viewUnregisteredCustomers = (req, res) => {
  try {
    let mrid = this.getMRID(req, res);
    this.getMeterReaderData(mrid,(error,results)=>{
        if(!error){
            let area_id = results[0].area_id;
            db.start.query(
                "SELECT * FROM customer LEFT JOIN bill ON customer.account_no = bill.acc_no AND ( MONTH(date_of_bill) = MONTH(CURRENT_DATE()) AND YEAR(date_of_bill) = YEAR(CURRENT_DATE()) ) WHERE username = '' AND password = '' AND area_id = ? ORDER BY acc_no ASC",
                [area_id],
                (error, results) => {
                  if (!error) {
                    res.render("./meter_reader", { customersData: results });
                  } else {
                    console.log(error);
                  }
                }
              );
        }
        else{
            console.log(error);
        }
    }
    )
    
  } catch (error) {
    console.log(error);
  }
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

      customerTasks.getOCR(url, (err, body) => {
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
              link:`/meter_reader/upload_image/${account_no}`,
              buttonType:"btn-secondary",
              buttonTxt:"Try Again"
            });
          } else {
            console.log(resultObj.result[0].prediction[0].ocr_text);
            // if there is a result
            let meterReading = resultObj.result[0].prediction[0].ocr_text; //get original result
            let account_no = req.params.id; //get account_no
            let current_reading;
            let balance;
            customerTasks.getCustomerData(account_no, (error, results) => {
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
                link:`/meter_reader/upload_image/${account_no}`,
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
                link:`/meter_reader/upload_image/${account_no}`,
                buttonType:"btn-secondary",
                buttonTxt:"Try Again",
                title: "Upload Meter Reading",
              });
            } else {
              //if no problem with the reading
              customerTasks.getCustomerData(account_no, (error, results) => {
                if (!error) {
                  let tariff = results[0].tariff;
                  res.render("meter_reader/confirm_reading", {
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

//confirm and generate bill
exports.generateBill = (req, res) => {
  let {
    tariff,
    meter_reading,
    current_reading,
    url,
    balance,
    account_no,
  } = req.body;
  account_no = account_no.trim();
  try {
    //get pricing
    customerTasks.getPricing(tariff, (error, results) => {
      try {
        if (error) {
          console.log(error);
        } else {
          //get price for units used
          let b1_30 = results[0].b1_30;
          let b31_60 = results[0].b31_60;
          let b61_90 = results[0].b61_90;
          let b91_120 = results[0].b91_120;
          let b121_180 = results[0].b121_180;
          let more_180 = results[0].more_180;
          let fixed_price = results[0].fixed_price;

          let no_of_units = meter_reading - current_reading;
          let total;
          //1-30
          if (no_of_units > 0 && no_of_units < 31) {
            total = b1_30 * no_of_units;
          } 
          //31-60
          else if (no_of_units > 30 && no_of_units < 61) {
            let remainder = no_of_units - 30;
            total = b1_30 * 30 + b31_60 * remainder;
          } 
          //61-90
          else if (no_of_units > 60 && no_of_units < 91) {
            let remainder = no_of_units - 60;
            total = b1_30 * 30 + b31_60 * 30 + b61_90 * remainder;
          } 
          //91-120
          else if (no_of_units > 91 && no_of_units < 121) {
            let remainder = no_of_units - 90;  
            total = b1_30 * 30 + b31_60 * 30 + b61_90 * 30 + b91_120 * remainder;
          }
          //121-180
          else if (no_of_units > 120 && no_of_units < 181) {
            let remainder = no_of_units - 120;  
            total = b1_30 * 30 + b31_60 * 30 + b61_90 * 30 + b91_120 * 30 + b121_180 * remainder;
          }
          //more than 180
          else if (no_of_units > 180) {
            let remainder = no_of_units - 180;  
            total = b1_30 * 30 + b31_60 * 30 + b61_90 * 30 + b91_120 * 30 + b121_180 * 30 + more_180 * remainder;
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
                markedby: "Meter Reader",
              },
            ],
            (error, results) => {
              if (!error) {
                db.start.query(
                  "UPDATE customer SET ? WHERE account_no = ?",
                  [
                    {
                      balance: payableAmount,
                      current_reading: meter_reading,
                    },account_no
                  ],
                  (error, results) => {
                    if (!error) {
                      return res.render("meter_reader/confirm_reading", {
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
    let account_no = req.params.id;
    //select bill of current month
    db.start.query("SELECT * FROM bill WHERE acc_no = ? AND ( MONTH(date_of_bill) = MONTH(CURRENT_DATE()) AND YEAR(date_of_bill) = YEAR(CURRENT_DATE()) )",
      [account_no],
      (error, bill_results) => {
        if(bill_results.length > 0){
          customerTasks.getCustomerData(account_no,(error,customerData)=>{
            if(!error){
              customerTasks.getPricing(customerData[0].tariff,(error,pricing)=>{ 
                if(!error){
                  return res.render("meter_reader/view_bill", {bill_results,customerData,pricing});
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
            link:"/meter_reader/upload_image",
            buttonType:"btn-secondary",
            buttonTxt:"Upload Meter Reading"
          });
        }
      });
  } catch (error) {
    console.log(error);
  }
};