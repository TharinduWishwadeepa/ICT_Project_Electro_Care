const db = require("../model/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var cloudinary = require('cloudinary').v2;
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
      "SELECT area_id,balance FROM customer WHERE account_no = ?",
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

//send image to nanonets and get result
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

//upload image and get OCR result
exports.uploadImage = (req,res,next)=>{
  var file;
    if(!req.files)
    {
        console.log("File was not found");
    }

    file = req.files.photo;  
    var url;
    cloudinary.uploader.upload(file.tempFilePath ,(error,results)=>{
      if(!error){
        url = results.secure_url;
        this.getOCR(url,(err,body)=>{
          if(err){
            console.log("eroor");
          }
          else{
            const resultObj = JSON.parse(body);
            
            if(resultObj.result[0].prediction.length === 0){ // if there is no result
              res.render("upload_image", { 
                messageWarning: "Cannot Get Reading",
                title : "Upload Meter Reading" });  
            }
            else{ // if there is a result
              var meterReading = resultObj.result[0].prediction[0].ocr_text;
              if(meterReading.length < 5){ //if the reading length is less than 5
                res.render("upload_image", { 
                  messageWarning: "Invalid Reading",
                  title : "Upload Meter Reading" }); 
              }
              else{
                meterReading = meterReading.slice(0, 5);
                res.render("upload_image", { meterReading,
                title : "Upload Meter Reading"});
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


