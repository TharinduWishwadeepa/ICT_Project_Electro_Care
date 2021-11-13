const db = require("../model/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var cloudinary = require('cloudinary').v2;

//cloudinary configuration
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
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
      "SELECT name, area_id, balance, tariff, current_reading FROM customer WHERE account_no = ?",
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
  this.getCustomerData(account_no, (error, results) => {
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

//view complain
exports.viewComplain = (req,res)=>{
  try {
    let account_no = this.getAccountNo(req, res);
    db.start.query('SELECT * FROM complain WHERE status = pending AND account_no = ? ORDER BY datetime DESC ',
    [account_no],(error,results)=>{
      if(!error){
        console.log(results);
        //render
      }
      else{
        console.log(error);
      }
    })
  } catch (error) {
    console.log(error);
  }
}

//get pricings
exports.getPricing = (tariff,callback)=>{
  try {
    db.start.query('SELECT * FROM pricing WHERE tariff = ?',[tariff],(error,results)=>{
      if(!error){
        return callback(null, results);
      }
      else{
        return callback(error, null);
      }
    })
    
  } catch (error) {
    console.log(error);
  }
}

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

//Nanonets OCR API
exports.getOCR = (urlimg,callback)=>{
  var request = require('request')
  var querystring = require('querystring')
  const form_data = {'urls' : [urlimg]}
  const options = {
      url : 'https://app.nanonets.com/api/v2/OCR/Model/8c1dfbf1-1e5c-4a34-87c7-f99d6b200034/LabelUrls/',
      body: querystring.stringify(form_data),
      headers: {
          'Authorization' : 'Basic ' + Buffer.from('mbVSBBs6tQB8S-AEbDrd7NS0zkad2N9Q' + ':').toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
      }
  }
  request.post(options, function(err, httpResponse, body) {
    if (!err) {
      return callback(null, body);
    } else {
      return callback(err, null);
    }
     
  });

  }

//upload image and get OCR result, analyze the reading before confirm
exports.uploadImage = (req,res,next)=>{
  var file;
    if(!req.files)
    {
        console.log("File was not found");
    }

    file = req.files.photo;  //get the image from form
    var url;
    cloudinary.uploader.upload(file.tempFilePath ,(error,results)=>{//upload the image
      if(!error){
        url = results.secure_url; // get URL of uploaded image

        this.getOCR(url,(err,body)=>{ //send URL to Nanonets OCR API
          if(err){
            console.log(error);
          }
          else{
            const resultObj = JSON.parse(body); //get the JSON Result of OCR
            
            if(resultObj.result[0].prediction.length === 0){ // if there is no result
              res.render("upload_image", { 
                messageWarning: "Cannot Get Reading",
                title : "Upload Meter Reading" }); 
            }
            else{ // if there is a result
              var meterReading = resultObj.result[0].prediction[0].ocr_text; //get original result
              let account_no = this.getAccountNo(req, res); //get account_no
              let current_reading;
              this.getCustomerData(account_no, (error, results) => {
                if (error) {
                  console.log(error);
                } else {
                  current_reading = results[0].current_reading; //get current reading
                }
              });
              meterReadingFormatted = meterReading.slice(0, 5); // get 1st 5 digits from meterReading
              //if the reading length is less than 5  
              if(meterReading.length < 5 ){ 
                res.render("upload_image", { 
                  messageWarning: "Invalid Reading",
                  title : "Upload Meter Reading" });
              }  
              //if meter reading is less than current_reading
              else if(meterReadingFormatted < current_reading){
                res.render("upload_image", { 
                  messageWarning: "Invalid Reading",
                  title : "Upload Meter Reading" });   
              }
              else{//if no problem with the reading
                res.render("confirm_reading", { meterReadingFormatted,
                title : "Confirm Meter Reading"});
              } 
            }	           
          }
        });   
      
      }
      else{
        console.log(error);
      }

    })
}

//confirm and generate bill
exports.confirmReading = (req,res)=>{
  try {
    
    //need to get pricing table
    
  } catch (error) {
    
  }
}

//view bill
exports.viewBill = (req,res)=>{
  try {
    let account_no = this.getAccountNo(req,res);
    
    //select bill of current month
    db.start.query('SELECT * FROM bill WHERE account_no = ? AND ( MONTH(date_of_bill) = MONTH(CURRENT_DATE()) AND YEAR(date_of_bill) = YEAR(CURRENT_DATE()) )'
    ,[account_no],(error,bill_results)=>{
      if(bill_results.length == 0){
        // if there is no bill
        res.render('view_bill',
        {messageWarning:'There is no bill for this month. Please submit the meter reading for this month'})
      }

      else if (bill_results.length > 1){
        // if there is a bill
        console.log(bill_results[0]);
        //get customer data
        this.getCustomerData(account_no,(error,customer_data)=> {
          if (error) {
            console.log(error);
          } else {
            //get pricings
            this.getPricing(customer_data[0].tariff,(error,pricing_results)=>{
              if(!error){
                //display bill
                res.render('view_bill',{customer_data, pricing_results, bill_results,
                title:'View Bill' });
                console.log(pricing_results);
              }
            })}
        });
      }
      else if(error){
        console.log(error);
      }
    })
  } catch (error) {
    console.log(error);
  }
}