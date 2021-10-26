const db = require("../model/db");

//* Customer Management */
//**********************/

//add a customer
exports.addCustomer = (req,res)=>{
    const {account_no,name,nic,address,area_id,current_reading,tariff,balance} = req.body;
    try {
        db.start.query("INSERT INTO customer SET account_no = ?, name = ?, nic = ?, address = ?, area_id = ?, current_reading = ?, tariff = ?, balance = ?") , 
        [account_no,name,nic,address,area_id,current_reading,tariff,balance],(error,results)=>{
            if(!error){
                return res.render("admin/add_customer", {
                    message: "Customer Registered!",
                  });
            }
            else{
                console.log(error);
            }
        }
    } catch (error) {
        console.log(error);
    }
}

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
exports.viewCustomer = (req,res)=>{
  try {
    db.start.query("SELECT * FROM customer WHERE account_no=?",[req.params.id], (error, results) => {
      if (!error) {
        console.log(results);
        res.render("./admin/viewcustomer",{customerData: results});
      } else {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
  }
}

//view unregistered customers
exports.viewUnregisteredCustomer = (req, res) => {
  try {
    db.start.query(
      "SELECT * FROM customer where username = '' AND password=''",
      (error, results) => {
        console.log(results);
        if (!error) {
          res.render("admin/customers", { customersData: results });
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
exports.searchCustomer = (req,res)=>{
    try {
        
    } catch (error) {
        console.log(error);
    }
};

//edit customer
exports.editCustomer = (req,res)=>{
    try {
        
    } catch (error) {
        console.log(error);
    }
}
//delete customer
exports.deleteCustomer = (req,res)=>{
    try {
        
    } catch (error) {
        console.log(error);
    }
}


//* Area Officer Management */

//add area office
exports.addAreaOffice = (req,res)=>{
    try {
        
    } catch (error) {
        console.log(error);
    }
}

//view all Area Offices
exports.viewAllAreaOffice = (req,res)=>{
    try {
        
    } catch (error) {
        console.log(error);
    }
}

//view Area Office
exports.viewAreaOffice = (req,res)=>{
    try {
        
    } catch (error) {
        console.log(error);
    }
}

//edit Area Office
exports.editAreaOffice = (req,res)=>{
    try {
        
    } catch (error) {
        console.log(error);
    }
}

//delete Area Office
exports.deleteAreaOffice = (req,res)=>{
    try {
        
    } catch (error) {
        console.log(error);
    }
}

//search Area Office
exports.searchAreaOffice = (req,res)=>{
    try {
        
    } catch (error) {
        console.log(error);
    }
}

//reset Password Area Office
exports.resetPWAreaOffice = (req,res)=>{
    try {
        
    } catch (error) {
        console.log(error);
    }
}

//**Meter Reader Management */

//view all Meter Readers
exports.viewAllMeterReaders = (req,res)=>{
    try {
        
    } catch (error) {
        console.log(error);
    }
}

//view Meter Reader
exports.viewMeterReader = (req,res)=>{
    try {
        
    } catch (error) {
        console.log(error);
    }
}

//edit Meter Reader
exports.editMeterReader = (req,res)=>{
    try {
        
    } catch (error) {
        console.log(error);
    }
}

//delete meter reader
exports.deleteMeterReader = (req,res)=>{
    try {
        
    } catch (error) {
        console.log(error);
    }
}

//search meter reader
exports.searchMeterReader = (req,res)=>{
    try {
        
    } catch (error) {
        console.log(error);
    }
}

//reset Password meter reader
exports.resetPWMeterReader = (req,res)=>{
    try {
        
    } catch (error) {
        console.log(error);
    }
}