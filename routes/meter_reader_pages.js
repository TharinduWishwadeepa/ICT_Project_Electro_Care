const express = require('express');
const router = express.Router();
const authController = require('../controllers/meter_reader_auth_control');
const readerTasks = require('../controllers/meter_reader_tasks');
const customerTasks = require("../controllers/customer_tasks");
const pdfService = require('../controllers/pdf-generate');

//gets
router.get('/', authController.isLoggedIn, (req, res) => {
    if(req.user) {
        res.locals.title = "Welcome";
        readerTasks.viewUnregisteredCustomers(req,res);
    } else {
        res.redirect('./meter_reader/login');
    }  
});

router.get('/login', authController.isLoggedIn, (req, res) => {
    if(req.user ) {
        res.redirect('../meter_reader');
    } else {
        res.locals.title = "Meter Reader Login";
        res.render('./meter_reader/login');
    }
});

router.get("/upload_image/:id", authController.isLoggedIn, (req, res) => {
    if (req.user) {
      let account_no = req.params.id;
      res.locals.title = "Upload Meter Reading";
      customerTasks.checkBillThisMonth(account_no,(error,bill)=>{
        if(bill == "no_bill"){
          res.render("./meter_reader/upload_image",{account_no: account_no})
        }
        else if(bill == "have_bill"){ 
          res.render("./meter_reader/upload_image",{alert:"info",
          alertTitle:"Info",
          text:"You have submitted the meter Reading for this month",
          link:`/meter_reader/view_bill/${account_no}`,
          buttonType:"btn-success",
          buttonTxt:"View Bill"
        });
        }
      })
  } else {
      res.redirect("/meter_reader");
    }
});

router.get('/view_bill/:id', authController.isLoggedIn, (req, res) => {
  if (req.user) {
    res.locals.title = "View Bill";  
    readerTasks.viewBill(req,res);
} else {
    res.redirect("/meter_reader");
  }
});

router.get("/change_password", authController.isLoggedIn, (req, res) => {
  if (req.user) {
    res.locals.title = "Change Password";
    res.render("meter_reader/change_password");
} else {
    res.redirect("/meter_reader");
  }
});

router.get("/settings", authController.isLoggedIn, (req, res) => {
  if (req.user) {
    res.locals.title = "Settings";

    let mrid = readerTasks.getMRID(req,res);
    readerTasks.getMeterReaderData(mrid, (error, readerData) => {
      if (error) {
        console.log(error);
      } else { 
         res.render("meter_reader/settings",{readerName: readerData[0].name})     
      }
    }) 
   } 
   else {
    res.redirect("/");
  }
});

router.get('/download/:bill_id', authController.isLoggedIn, (req,res)=>{
  if (req.user) {
    const stream = res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment;filename=invoice.pdf`,
    });
    pdfService.buildPDF(req,
      (chunk) => stream.write(chunk),
      () => stream.end()
    );
} 
else {
    res.redirect("/meter_reader");
  }
})

router.post('/upload_image/:id', readerTasks.uploadImage);
router.post('/confirm_reading/:id', readerTasks.generateBill);
router.post('/search', readerTasks.searchCustomer);

module.exports = router;