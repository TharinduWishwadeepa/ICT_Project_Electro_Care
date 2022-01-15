const db = require("../model/db");
const bcrypt = require("bcryptjs");
const notify = require("./notifications");
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
  console.log(req.body);
  try {
    db.start.query(
      "INSERT INTO customer SET ?",
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
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//pass data to add_customer page
exports.renderAddCustomer = (req, res) => {
  try {
    db.start.query(
      "SELECT area_id, area_name from areaoffice",
      (error, officeList) => {
        if (!error) {
          db.start.query("SELECT tariff FROM pricing", (error, tariffList) => {
            if (!error) {
              return res.render("./admin/add_customer", {
                officeList,
                tariffList,
              });
            } else {
              console.log(error);
            }
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
//view all customers
exports.viewAllCustomers = (req, res) => {
  try {
    db.start.query("SELECT * FROM customer", (error, results) => {
      if (!error) {
        res.render("./admin", {
          customersData: results,
          heading: "All Customers",
        });
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
      "SELECT customer.*,areaoffice.area_name FROM customer INNER JOIN areaoffice ON customer.area_id = areaoffice.area_id WHERE account_no = ?",
      [req.params.id],
      (error, results) => {
        if (!error) {
          console.log(results);
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
          res.render("./admin", {
            customersData: results,
            heading: "Unregistered Customers",
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

//view registered customers
exports.viewRegisteredCustomers = (req, res) => {
  try {
    db.start.query(
      "SELECT * FROM customer WHERE username != '' AND password != '' ",
      (error, results) => {
        if (!error) {
          res.render("./admin", {
            customersData: results,
            heading: "Registered Customers",
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

//search customer
exports.searchCustomer = (req, res) => {
  const searchTerm = req.query.search;
  try {
    db.start.query(
      "SELECT * FROM customer WHERE account_no LIKE ? OR name LIKE ?",
      ["%" + searchTerm + "%", "%" + searchTerm + "%"],
      (error, results) => {
        if (!error) {
          res.render("./admin", {
            customersData: results,
            heading: `Search results: "${req.query.search}"`,
            searchTerm: req.query.search,
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

//edit customer - Send the editing data to the form
exports.editCustomer = (req, res) => {
  try {
    db.start.query(
      "SELECT customer.*,areaoffice.area_name FROM customer INNER JOIN areaoffice ON customer.area_id = areaoffice.area_id WHERE account_no = ?",
      [req.params.id],
      (error, results) => {
        if (!error) {
          db.start.query(
            "SELECT area_id, area_name from areaoffice",
            (error, officeList) => {
              if (!error) {
                db.start.query(
                  "SELECT tariff FROM pricing",
                  (error, tariffList) => {
                    if (!error) {
                      return res.render("./admin/edit_customer", {
                        customerData: results,
                        officeList,
                        tariffList,
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
    db.start.query(
      "UPDATE customer SET ? WHERE account_no = ?",
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
        account_no,
      ],
      (error, results) => {
        if (!error) {
          try {
            db.start.query(
              "SELECT customer.*,areaoffice.area_name FROM customer INNER JOIN areaoffice ON customer.area_id = areaoffice.area_id WHERE account_no = ?",
              [account_no],
              (error, results) => {
                db.start.query(
                  "SELECT area_id, area_name from areaoffice",
                  (error, officeList) => {
                    if (!error) {
                      db.start.query(
                        "SELECT tariff FROM pricing",
                        (error, tariffList) => {
                          if (!error) {
                            res.render("./admin/edit_customer", {
                              customerData: results,
                              officeList,
                              tariffList,
                              message: `${account_no} has been updated!`,
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
exports.viewComplaints = (req, res) => {
  try {
    //select complaint records
    db.start.query(
      "SELECT * FROM complain WHERE complain_to = 'admin'",
      (error, results) => {
        if (!error) {
          //count of all complaints ---
          db.start.query(
            "SELECT COUNT(complain_id) AS countAll FROM complain WHERE complain_to = 'admin'",
            (error, countAll) => {
              if (!error) {
                //count of new complaints  ---
                db.start.query(
                  "SELECT COUNT(complain_id) AS countNew FROM complain WHERE status = 'Pending' AND complain_to = 'admin'",
                  (error, countNew) => {
                    if (!error) {
                      //count of in progress ---
                      db.start.query(
                        "SELECT COUNT(complain_id) AS countInProgress FROM complain WHERE status = 'In Progress' AND complain_to = 'admin'",
                        (error, countInProgress) => {
                          if (!error) {
                            //count of completed ---
                            db.start.query(
                              "SELECT COUNT(complain_id) AS countCompleted FROM complain WHERE status = 'Completed' AND complain_to = 'admin'",
                              (error, countCompleted) => {
                                if (!error) {
                                  return res.render("./admin/complaints", {
                                    Complains: results,
                                    countAll: countAll[0].countAll,
                                    countNew: countNew[0].countNew,
                                    countInProgress:
                                      countInProgress[0].countInProgress,
                                    countCompleted:
                                      countCompleted[0].countCompleted,
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
          console.log(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//get single complain
exports.viewComplain = (req, res) => {
  try {
    db.start.query(
      "SELECT * FROM complain INNER JOIN customer ON complain.account_no = customer.account_no WHERE complain_id = ?",
      [req.params.comp_id],
      (error, results) => {
        if (!error) {
          return res.render("admin/view_complaint", { results });
        } else {
          console.log(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

exports.replyComplaint = (req, res) => {
  let { account_no, complain_id, status, reply } = req.body;
  try {
    db.start.query(
      "UPDATE complain SET ? WHERE complain_id = ?",
      [
        {
          status: status,
          reply: reply,
        },
        complain_id,
      ],
      (error, results) => {
        if (!error) {
          let notification = {
            type: "Complain",
            title: `The status of the complain id : ${complain_id} has been changed to ${status}`,
            description: `${reply}`,
            notification_to: account_no,
            notification_from: "Admin",
            link: "#",
          };
          notify.makeNotification(notification, (error, results) => {
            if (results == "success") {
              db.start.query(
                "SELECT * FROM complain INNER JOIN customer ON complain.account_no = customer.account_no WHERE complain_id = ?",
                [complain_id],
                (error, results) => {
                  if (!error) {
                    return res.render("admin/view_complaint", { results });
                  } else {
                    console.log(error);
                  }
                }
              );
            }
          });
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//change the status of the user

//change password of Admin
exports.changePW = (req, res) => {
  let { current_pw, new_pw, confirm_pw } = req.body;
  try {
    if (!current_pw || !new_pw || !confirm_pw) {
      return res.status(400).render("./admin/change_password", {
        messageWarning: "Please provide required details",
        title: "Change Password",
      });
    }
    if (new_pw != confirm_pw) {
      return res.status(400).render("./admin/change_password", {
        messageWarning: "New Passwords do not match",
        title: "Change Password",
      });
    }
    db.start.query(
      "SELECT password FROM admin WHERE id = 1",
      async (error, results) => {
        if (!error) {
          if (!(await bcrypt.compare(current_pw, results[0].password))) {
            return res.status(400).render("./admin/change_password", {
              messageWarning: "Current Password is incorrect",
              title: "Change Password",
            });
          } else {
            let hashedPW = await bcrypt.hash(new_pw, 10);
            db.start.query(
              "UPDATE admin SET password =? WHERE id=1",
              [hashedPW],
              (error, results) => {
                if (!error) {
                  return res.status(200).render("./admin/change_password", {
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

//* Pricing Management */
//**********************/

//add pricing
exports.addPricing = (req, res) => {
  let {
    tariff,
    b1_30,
    b31_60,
    b61_90,
    b91_120,
    b121_180,
    more_180,
    fixed_price,
  } = req.body;
  try {
    db.start.query(
      "INSERT INTO pricing SET ?",
      [
        {
          tariff: tariff,
          b1_30: b1_30,
          b31_60: b31_60,
          b61_90: b61_90,
          b91_120: b91_120,
          b121_180: b121_180,
          more_180: more_180,
          fixed_price: fixed_price,
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
  let {
    tariff,
    b1_30,
    b31_60,
    b61_90,
    b91_120,
    b121_180,
    more_180,
    fixed_price,
  } = req.body;
  try {
    db.start.query(
      "UPDATE pricing SET ? WHERE tariff = ?",
      [
        {
          b1_30: b1_30,
          b31_60: b31_60,
          b61_90: b61_90,
          b91_120: b91_120,
          b121_180: b121_180,
          more_180: more_180,
          fixed_price: fixed_price,
        },
        tariff,
      ],
      (error, results) => {
        if (!error) {
          try {
            db.start.query(
              "SELECT * FROM pricing WHERE tariff = ?",
              [tariff],
              (error, results) => {
                if (!error) {
                  res.render("admin/edit_pricing", {
                    results,
                    message: "Tariff has been updated!",
                  });
                } else {
                  console.log(error);
                }
              }
            );
          } catch (error) {}
        }
      }
    );
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
        res.render("./admin/area_offices", {
          Data: results,
          heading: "Area Officers",
        });
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
          res.render("./admin/edit_area_office", { Data: results });
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
  console.log(req.body);
  try {
    db.start.query(
      "UPDATE areaoffice SET ? WHERE area_id = ?",
      [
        {
          area_name: area_name,
          address: address,
          telephone_no: telephone_no,
          district: district,
          province: province,
        },
        area_id,
      ],
      (error, results) => {
        if (!error) {
          try {
            db.start.query(
              "SELECT * FROM areaoffice WHERE area_id = ?",
              [area_id],
              (error, results) => {
                if (!error) {
                  res.render("./admin/edit_area_office", {
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
      }
    );
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
          res.render("./admin/area_offices", {
            Data: results,
            searchTerm: req.query.search,
            heading: `Search results: "${searchTerm}"`,
            title: "Search Results",
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

//reset Password Area Office
exports.resetPWAreaOffice = (req, res) => {
  let { area_id, password, conf_password } = req.body;
  try {
    db.start.query(
      "SELECT * FROM areaoffice WHERE area_id = ?",
      [area_id],
      async (error, Data) => {
        if (!error) {
          let hashedPW = await bcrypt.hash(password, 10);
          db.start.query(
            "UPDATE areaoffice SET password = ? WHERE area_id = ?",
            [hashedPW, area_id],
            (error, results) => {
              if (!error) {
                return res.status(200).render("./admin/edit_area_office", {
                  mSuccess: "Password Updated",
                  title: "Change Password",
                  Data,
                });
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

//**Meter Reader Management */
//render add meter reader
exports.renderAddReader = (req, res) => {
  try {
    db.start.query(
      "SELECT area_id, area_name FROM areaoffice",
      (error, results) => {
        if (!error) {
          return res.render("admin/add_meter_reader", { officeList: results });
        } else {
          console.log(error);
        }
      }
    );
  } catch (error) {}
};
//add meter reader
exports.addMeterReader = (req, res) => {
  try {
    const { reader_id, name, contact_no, area_id, password, conf_password } =
      req.body;
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
  } catch (error) {}
};
//view all Meter Readers
exports.viewAllMeterReaders = (req, res) => {
  try {
    db.start.query(
      "SELECT * FROM meter_reader INNER JOIN areaoffice ON meter_reader.area_id = areaoffice.area_id",
      (error, results) => {
        if (!error) {
          res.render("./admin/meter_readers", {
            Data: results,
            heading: "Meter Readers",
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

//edit Meter Reader - Send the editing data to the form
exports.editMeterReader = (req, res) => {
  try {
    db.start.query(
      "SELECT meter_reader.*,areaoffice.area_name FROM meter_reader INNER JOIN areaoffice ON  meter_reader.area_id = areaoffice.area_id WHERE reader_id = ?",
      [req.params.id],
      (error, Data) => {
        if (!error) {
          db.start.query(
            "SELECT area_id, area_name FROM areaoffice",
            (error, officeList) => {
              if (!error) {
                res.render("./admin/edit_meter_reader", { officeList, Data });
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
    db.start.query(
      "SELECT * FROM meter_reader INNER JOIN areaoffice ON meter_reader.area_id = areaoffice.area_id WHERE reader_id LIKE ? OR name LIKE ? OR area_name LIKE ?",
      ["%" + searchTerm + "%", "%" + searchTerm + "%", "%" + searchTerm + "%"],
      (error, results) => {
        if (!error) {
          res.render("./admin/meter_readers", {
            Data: results,
            searchTerm: req.query.search,
            heading: `Search results: "${searchTerm}"`,
            title: "Search results",
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

//render reset Password meter reader
exports.renderRestPWMR = (req, res) => {
  try {
    db.start.query(
      "SELECT * FROM meter_reader WHERE reader_id = ?",
      [req.params.id],
      (error, Data) => {
        if (!error) {
          return res.render("admin/update_pw_meter_reader", { reader_id: Data[0].reader_id });
        }
      }
    );
  } catch (error) {}
};

//reset Password meter reader
exports.resetPWMeterReader = (req, res) => {
  let { reader_id, password, conf_password } = req.body;
  try {
    bcrypt.hash(password, 10).then(function(hash) {
      db.start.query(
        "UPDATE meter_reader SET password = ? WHERE reader_id = ?",
        [hash, reader_id],
        (error, results) => {
          if (!error) {
            return res.status(200).render("./admin/update_pw_meter_reader", {
              mSuccess: "Password Updated",
              title: "Change Password",
              reader_id
            });
          }
        }
      );
  });
    
    
  } catch (error) {
    console.log(error);
  }

};
