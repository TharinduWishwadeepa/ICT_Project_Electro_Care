const db = require("../model/db");
const bcrypt = require("bcryptjs");

//* Customer Management */
//**********************/

//add a customer
exports.addCustomer = (req, res) => {
  const {
    account_no,
    name,
    nic, 
    address,
    area_id,
    current_reading,
    tariff,
    balance,
  } = req.body;

  try {
    db.start.query("INSERT INTO customer SET ?"),
      [
        {
          account_no: account_no,
          name: name,
          nic: nic,
          address: address,
          area_id: area_id,
          current_reading: current_reading,
          tariff: tariff,
          balance: balance,
        },
      ],
      (error, results) => {
        if (!error) {
          return res.render("./admin/add_customer", {
            message: "Customer Registered!",
          });
        } else {
          console.log(error);
        }
      };
  } catch (error) {
    console.log(error);
  }
};

//pass data to add_customer page
exports.renderAddCustomer = (req,res)=>{
  try {
    db.start.query("SELECT area_id, area_name from areaoffice",(error,officeList)=>{
      if(!error){
        db.start.query("SELECT tariff FROM pricing",(error,tariffList)=>{
          if(!error){
            return res.render("./admin/add_customer", {officeList, tariffList})
          }
          else{
            console.log(error);
          }
        })
      }
      else{
        console.log(error)
      }
    })
  } catch (error) {
    console.log(error);
  }
}
//view all customers
exports.viewAllCustomers = (req, res) => {
  try {
    db.start.query("SELECT * FROM customer", (error, results) => {
      if (!error) {
        res.render("./admin", { customersData: results,
        heading:"All Customers" });
      } else {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//view details of one customer
exports.viewCustomer = (req, res) => {
  try {
    db.start.query(
      "SELECT * FROM customer WHERE account_no = ?",
      [req.params.id],
      (error, results) => {
        if (!error) {
          res.render("./admin/view_customer", { customerData: results });
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
    db.start.query(
      "SELECT * FROM customer WHERE username = '' AND password = '' ",
      (error, results) => {
        if (!error) {
          res.render("./admin", { customersData: results,
            heading:"Unregistered Customers" });
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
  try {
    db.start.query(
      "SELECT * FROM customer WHERE username != '' AND password != '' ",
      (error, results) => {
        if (!error) {
          res.render("./admin", { customersData: results,
            heading:"Registered Customers" });
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
    db.start.query(
      "SELECT * FROM customer WHERE account_no LIKE ? OR name LIKE ?",
      ["%" + searchTerm + "%", "%" + searchTerm + "%"],
      (error, results) => {
        if (!error) {
          res.render("./admin", { customersData: results,
            heading:`Search results: "${req.query.search}"`,
          searchTerm:req.query.search});
        } else {
          console.log(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//edit customer - Send the editing data to the form
exports.editCustomer = (req, res) => {
  try {
    db.start.query(
      "SELECT * FROM customer WHERE account_no = ?",
      [req.params.id],
      (error, results) => {
        if (!error) {
          console.log(results);
          res.render("./admin/edit_customer", { customerData: results });
        } else {
          console.log(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//update customer
exports.updateCustomer = (req, res) => {
  const {
    account_no,
    name,
    nic,
    address,
    area_id,
    current_reading,
    tariff,
    balance,
  } = req.body;
  try {
    db.start.query("UPDATE customer SET ? WHERE account_no = ?"),
      [
        {
          name: name,
          nic: nic,
          address: address,
          area_id: area_id,
          current_reading: current_reading,
          tariff: tariff,
          balance: balance,
        },
        req.params.id,
      ],
      (error, results) => {
        if (!error) {
          try {
            db.start.query(
              "SELECT * FROM customer WHERE account_no=?",
              [req.params.id],
              (error, results) => {
                if (!error) {
                  console.log(results);
                  res.render("./admin/edit_customer", {
                    customerData: results,
                    message: `${account_no} has been updated!`,
                  });
                } else {
                  console.log(error);
                }
              }
            );
          } catch (error) {
            console.log(error);
          }
        } else {
          console.log(error);
        }
      };
  } catch (error) {
    console.log(error);
  }
};

//delete customer
exports.deleteCustomer = (req, res) => {
  try {
    db.start.query(
      "DELETE FROM customer WHERE account_no = ?",
      [req.params.id],
      (error, results) => {
        if (!error) {
          res.redirect("./admin/customer");
        } else {
          console.log(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//view complaints
exports.viewComplaints = (req,res)=>{
  try {
    //WHERE complain_to = 'admin'
    //select complaint records
    db.start.query("SELECT * FROM complain ",(error,results)=>{
      if(!error){
        //count of all complaints --- AND complain_to = 'admin'
        db.start.query("SELECT COUNT(complain_id) AS countAll FROM complain",(error,countAll)=>{
          if(!error){
            //count of new complaints  --- AND complain_to = 'admin' 
            db.start.query("SELECT COUNT(complain_id) AS countNew FROM complain WHERE status = 'Pending'",(error,countNew)=>{
              if(!error){
                //count of in progress --- AND complain_to = 'admin'
                db.start.query("SELECT COUNT(complain_id) AS countInProgress FROM complain WHERE status = 'In Progress'",(error,countInProgress)=>{
                  if(!error){
                    //count of completed --- AND complain_to = 'admin'
                    db.start.query("SELECT COUNT(complain_id) AS countCompleted FROM complain WHERE status = 'Completed'",(error,countCompleted)=>{
                      if(!error){
                        return res.render('./admin/complaints',{
                          Complains: results,
                          countAll: countAll[0].countAll,
                          countNew: countNew[0].countNew,
                          countInProgress: countInProgress[0].countInProgress,
                          countCompleted: countCompleted[0].countCompleted
                        })
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
      else{
        console.log(error);
      }
    })
  } catch (error) {
    console.log(error);
  }
}

//change the status of the user

//* Pricing Management */
//**********************/

//add pricing
exports.addPricing = (req, res) => {
  let { tariff, b1_30, b31_60, b61_90, b91_105,fixed_price } = req.body;
  try {
    db.start.query(
      "INSERT INTO pricing SET ?",
      [
        {
          tariff: tariff,
          b1_30: b1_30,
          b31_60: b31_60,
          b61_90: b61_90,
          b91_105: b91_105,
          fixed_price: fixed_price
        },
      ],
      (error, results) => {
        if (!error) {
          return res.render("./admin/add_pricing", {
            message: "Pricing Added!",
            title: "Add Pricing",
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

//view all pricings in a table
exports.viewAllPricings = (req, res) => {
  try {
    db.start.query("SELECT * FROM pricing", (error, results) => {
      if (!error) {
        res.render("./admin/pricings", { results });
      } else {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//edit pricing - Send the editing data to the form
exports.editPricing = (req, res) => {
  try {
    db.start.query(
      "SELECT * FROM pricing WHERE tariff = ?",
      [req.params.id],
      (error, results) => {
        if (!error) {
          res.render("admin/edit_pricing", { results });
        } else {
          console.log(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//update pricing
exports.updatePricing = (req, res) => {
  let { tariff, b1_30, b31_60, b61_90, b91_105,fixed_price } = req.body;
  try {
    db.start.query("UPDATE pricing SET ? WHERE tariff = ?",
    [{
          b1_30: b1_30,
          b31_60: b31_60,
          b61_90: b61_90,
          b91_105: b91_105,
          fixed_price: fixed_price
    },
    tariff
  ],(error,results)=>{
    if(!error){
      try {
        db.start.query(
          "SELECT * FROM pricing WHERE tariff = ?",
          [tariff],
          (error, results) => {
            if (!error) {
              res.render("admin/edit_pricing", { results,
                message: "Tariff has been updated!", });
            } else {
              console.log(error);
            }
          }
        );
      } catch (error) {
        
      }
    }
  })
  } catch (error) {
    console.log(error);
  }
};

//* Area Officer Management */
//**********************/

//add area office
exports.addAreaOffice = (req, res) => {
  const {
    area_id,
    area_name,
    address,
    telephone_no,
    district,
    province,
    password,
    conf_password,
  } = req.body;
  //check empty or not
  if (
    !area_id ||
    !area_name ||
    !address ||
    !telephone_no ||
    !district ||
    !province ||
    !password ||
    !conf_password
  ) {
    return res.status(400).render("admin/add_areaoffice", {
      messageWarning: "Please provide required fields",
      title: "Add Area Office",
    });
  }
  //check passwords
  else if (password != conf_password) {
    return res.render("admin/add_areaoffice", {
      messageWarning: "Passwords do not match!",
      title: "Add Area Office",
    });
  }
  try {
    //check if the area office exists
    db.start.query(
      "SELECT * FROM areaoffice WHERE area_id = ?",
      [area_id],
      async (error, results) => {
        if (results.length > 0) {
          return res.render("admin/add_areaoffice", {
            messageWarning: "Already Registered!",
            title: "Add Area Office",
          });
        } else {
          const hashedPW = await bcrypt.hash(password, 10);
          db.start.query(
            "INSERT INTO areaoffice SET ?",
            [
              {
                area_id: area_id,
                area_name: area_name,
                address: address,
                telephone_no: telephone_no,
                district: district,
                province: province,
                password: hashedPW,
              },
            ],
            (error, results) => {
              if (!error) {
                return res.render("admin/add_areaoffice", {
                  message: "Area Office Registered Successfully!",
                  title: "Add Area Office",
                });
              } else {
                console.log(error);
              }
            }
          );
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//view all Area Offices
exports.viewAllAreaOffices = (req, res) => {
  try {
    db.start.query("SELECT * FROM areaoffice", (error, results) => {
      if (!error) {
        
        res.render("./admin/area_offices", { Data: results,
        heading:"Area Officers" });
      } else {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//view Area Office
exports.viewAreaOffice = (req, res) => {
  try {
    db.start.query(
      "SELECT * FROM areaoffice WHERE area_id = ?",
      [req.params.id],
      (error, results) => {
        if (!error) {
          res.render("./admin/view_areaoffice", { Data: results });
        } else {
          console.log(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//edit Area Office - Send the editing data to the form
exports.editAreaOffice = (req, res) => {
  try {
    db.start.query(
      "SELECT * FROM areaoffice WHERE area_id = ?",
      [req.params.id],
      (error, results) => {
        if (!error) {
          console.log(results);
          res.render("./admin/edit_areaoffice", { Data: results });
        } else {
          console.log(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//update Area Office
exports.updateAreaOffice = (req, res) => {
  const { area_id, area_name, address, telephone_no, district, province } =
    req.body;
  try {
    db.start.query("UPDATE areaoffice SET ? WHERE area_id = ?"),
      [
        {
          area_name: area_name,
          address: address,
          telephone_no: telephone_no,
          district: district,
          province: province,
        },
        req.params.id,
      ],
      (error, results) => {
        if (!error) {
          try {
            db.start.query(
              "SELECT * FROM areaoffice WHERE area_id = ?",
              [req.params.id],
              (error, results) => {
                if (!error) {
                  console.log(results);
                  res.render("./admin/edit_areaoffice", {
                    Data: results,
                    message: `${area_id} has been updated!`,
                  });
                } else {
                  console.log(error);
                }
              }
            );
          } catch (error) {
            console.log(error);
          }
        } else {
          console.log(error);
        }
      };
  } catch (error) {
    console.log(error);
  }
};

//delete Area Office
exports.deleteAreaOffice = (req, res) => {
  try {
    db.start.query(
      "DELETE FROM areaoffice WHERE area_id = ?",
      [req.params.id],
      (error, results) => {
        if (!error) {
          res.redirect("./admin/area_offices");
        } else {
          console.log(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//search Area Office
exports.searchAreaOffice = (req, res) => {
  const searchTerm = req.query.search;
  try {
    db.start.query(
      "SELECT * FROM areaoffice WHERE area_id LIKE ? OR area_name LIKE ? OR province LIKE ?",
      ["%" + searchTerm + "%", "%" + searchTerm + "%", "%" + searchTerm + "%"],
      (error, results) => {
        if (!error) {
          res.render("./admin/area_offices", { Data: results, 
            searchTerm:req.query.search,
            heading:`Search results: "${searchTerm}"`, 
            title:"Search Results" });
        } else {
          console.log(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//reset Password Area Office
exports.resetPWAreaOffice = (req, res) => {
  try {
  } catch (error) {
    console.log(error);
  }
};

//**Meter Reader Management */

//add meter reader
exports.addMeterReader = (req,res)=>{
  try {
    const {
      reader_id,
      name,
      contact_no,
      area_id,
      password,
      conf_password,
    } = req.body;
    //check empty or not
    if (
      !reader_id ||
      !name ||
      !contact_no ||
      !area_id ||
      !password ||
      !conf_password
    ) {
      return res.status(400).render("admin/add_meter_reader", {
        messageWarning: "Please provide required fields",
        title: "Add Meter Reader",
      });
    }
    //check passwords
    else if (password != conf_password) {
      return res.render("admin/add_meter_reader", {
        messageWarning: "Passwords do not match!",
        title: "Add Meter Reader",
      });
    }
    try {
      //check if the meter reader exists
      db.start.query(
        "SELECT * FROM meter_reader WHERE reader_id = ?",
        [reader_id],
        async (error, results) => {
          if (results.length > 0) {
            return res.render("admin/add_meter_reader", {
              messageWarning: "Already Registered!",
              title: "Add Meter Reader",
            });
          } else {
            const hashedPW = await bcrypt.hash(password, 10);
            db.start.query(
              "INSERT INTO meter_reader SET ?",
              [
                {
                  reader_id: reader_id,
                  name: name,
                  contact_no: contact_no,
                  area_id: area_id,
                  password: hashedPW,
                },
              ],
              (error, results) => {
                if (!error) {
                  return res.render("admin/add_meter_reader", {
                    message: "Meter Reader Registered Successfully!",
                    title: "Add Meter Reader",
                  });
                } else {
                  console.log(error);
                }
              }
            );
          }
        }
      );
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    
  }
}
//view all Meter Readers
exports.viewAllMeterReaders = (req, res) => {
  try {
    db.start.query("SELECT * FROM meter_reader INNER JOIN areaoffice ON meter_reader.area_id = areaoffice.area_id", (error, results) => {
      if (!error) {
        res.render("./admin/meter_readers", { Data: results,
          heading:"Meter Readers" });
      } else {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//view Meter Reader
exports.viewMeterReader = (req, res) => {
  try {
  } catch (error) {
    console.log(error);
  }
};

//edit Meter Reader - Send the editing data to the form
exports.editMeterReader = (req, res) => {
  try {
    db.start.query(
      "SELECT * FROM meter_reader WHERE reader_id = ?",
      [req.params.id],
      (error, results) => {
        if (!error) {
          console.log(results);
          res.render("./admin/edit_meter_reader", { Data: results });
        } else {
          console.log(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//update Meter Reader
exports.updateMeterReader = (req, res) => {
  try {
  } catch (error) {
    console.log(error);
  }
};

//delete meter reader
exports.deleteMeterReader = (req, res) => {
  try {
  } catch (error) {
    console.log(error);
  }
};

//search meter reader
exports.searchMeterReader = (req, res) => {
  const searchTerm = req.query.search;
  try {
    db.start.query("SELECT * FROM meter_reader INNER JOIN areaoffice ON meter_reader.area_id = areaoffice.area_id WHERE reader_id LIKE ? OR name LIKE ? OR area_name LIKE ?",
    ["%" + searchTerm + "%", "%" + searchTerm + "%", "%" + searchTerm + "%"], (error, results) => {
      if (!error) {
        res.render("./admin/meter_readers", { Data: results,
          searchTerm:req.query.search,
          heading:`Search results: "${searchTerm}"`,
        title:"Search results" });
      } else {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//reset Password meter reader
exports.resetPWMeterReader = (req, res) => {
  try {
  } catch (error) {
    console.log(error);
  }
};
