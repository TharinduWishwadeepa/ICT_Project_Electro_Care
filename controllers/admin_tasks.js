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

//view all customers
exports.viewAllCustomers = (req, res) => {
  try {
    db.start.query("SELECT * FROM customer", (error, results) => {
      if (!error) {
        res.render("./admin/customers", { customersData: results });
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
          res.render("./admin/customers", { customersData: results });
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
  const searchTerm = req.body.search;
  try {
    db.start.query(
      "SELECT * FROM customer WHERE account_no LIKE ? OR name LIKE ?",
      ["%" + searchTerm + "%", "%" + searchTerm + "%"],
      (error, results) => {
        if (!error) {
          res.render("./admin/customers", { customersData: results });
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

//change the status of the user

//* Pricing Management */
//**********************/

//add pricing
exports.addPricing = (req,res)=>{
  let {tariff, b1_30, b31_60, b61_90,b91_105} = req.body;
  try {
    db.start.query('INSERT INTO pricing SET ?',
    [{tariff: tariff,
      b1_30: b1_30,
      b31_60: b31_60,
      b61_90: b61_90,
      b91_105: b91_105,
    }
    ],(error,results)=>{
      if(!error){
        return res.render("./admin/add_pricing", {
          message: "Pricing Added!",
          title: 'Add Pricing',
        });
      }
      else{
        console.log(error);
      }
    })
  } catch (error) {
    console.log(error);
  }
}

//view all pricings in a table
exports.viewAllPricings = (req,res)=>{
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
}

//edit pricing - Send the editing data to the form
exports.editPricing = (req,res)=>{
  try {
    db.start.query('SELECT * FROM pricing WHERE tariff = ?',[req.params.id],
    (error,results)=>{
      if (!error) {
        res.render("admin/edit_pricing", { results });
      } else {
        console.log(error);
      }
    })
    
  } catch (error) {
    console.log(error);
  }
}


//* Area Officer Management */

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
      title:'Add Area Office',
    });
  }
  //check passwords
  else if (password != conf_password) {
    return res.render("admin/add_areaoffice", {
      messageWarning: "Passwords do not match!",
      title:'Add Area Office',
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
            title:'Add Area Office',
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
                  title:'Add Area Office',
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
        res.render("./admin/area_offices", { Data: results });
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
  const searchTerm = req.body.search;
  try {
    db.start.query(
      "SELECT * FROM areaoffice WHERE area_id LIKE ? OR area_name LIKE ? OR province LIKE ?",
      ["%" + searchTerm + "%", "%" + searchTerm + "%", "%" + searchTerm + "%"],
      (error, results) => {
        if (!error) {
          res.render("./admin/area_offices", { Data: results });
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

//view all Meter Readers
exports.viewAllMeterReaders = (req, res) => {
  try {
    db.start.query("SELECT * FROM meter_reader", (error, results) => {
      if (!error) {
        res.render("./admin/meter_readers", { Data: results });
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
  try {
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
