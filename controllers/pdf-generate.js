const PDFDocument = require("pdfkit");
const customerTasks = require("./customer_tasks");
const db = require("../model/db");
var moment = require('moment');

function buildPDF(req, dataCallback, endCallback) {
  const doc = new PDFDocument({ bufferPages: true, font: "Helvetica" });
  doc.on("data", dataCallback);
  doc.on("end", endCallback);
  //select bill of current month
  db.start.query(
    "SELECT * FROM bill WHERE bill_id = ?",
    [req.params.bill_id],
    (error, bill_results) => {
      if (bill_results.length > 0) {
        customerTasks.getCustomerData(
          bill_results[0].acc_no,
          (error, customerData) => {
            if (!error) {
              customerTasks.getPricing(
                customerData[0].tariff,
                (error, pricing) => {
                  if (!error) {
                    //generate pdf
                    doc.image('public/logo-pdf.jpg', {fit: [100, 100], align: 'center', valign: 'center'});
                    doc.moveDown();
                    doc
                      .fontSize(20)
                      .text(`Electro Care Monthly Electricity Bill`, {
                        align: "center",
                      });
                    doc.moveDown();
                    doc
                    .fontSize(12).
                    text(`Billing Month: ${moment(bill_results[0].date_of_bill).format('YYYY-MM')}`); 
                    doc.moveDown();
                    doc.text(`Account No: ${customerData[0].account_no}`);
                    doc.moveDown();
                    doc.text(`Customer Name: ${customerData[0].name}`);
                    doc.moveDown();
                    doc.text(`Total No. of Units Consumed: ${bill_results[0].no_of_units}`);
                    doc.moveDown();
                    doc.text(`Fixed Charge: Rs. ${pricing[0].fixed_price}`);
                    doc.moveDown();
                    doc.text(`Charge for Units Consumed: Rs. ${bill_results[0].cost_of_usage}`);
                    doc.moveDown();
                    doc.text(`Balance Brought Forward: Rs. ${(customerData[0].balance - bill_results[0].cost_of_usage).toFixed(2)}`);
                    doc.moveDown();
                    doc.fontSize(15).text(`Total Amount: Rs. ${bill_results[0].total_payable}`);
                    doc.end(); 
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
        console.log("in else");
      }
    }
  );
}

module.exports = { buildPDF };
