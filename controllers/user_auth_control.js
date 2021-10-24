const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { promisify } = require("util");

const db = require("../model/db");

//login
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).render("login", {
        message: "Please provide the username and password",
      });
    }
    db.start.query(
      "SELECT * FROM customer WHERE username = ?",
      [username],
      async (error, results) => {
        if (
          !results ||
          !(await bcrypt.compare(password, results[0].password))
        ) {
          res.status(401).render("login", {
            message: "Username or Password is incorrect!",
          });
        } else {
          const id = results[0].account_no;
          const token = jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
          });
          const cookieOptions = {
            expires: new Date(
              Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
          };
          res.cookie("jwt", token, cookieOptions);
          res.status(200).redirect("/");
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};
//register controller
exports.register = (req, res) => {
  const {
    name,
    account_no,
    email,
    mobile_no,
    username,
    password,
    conf_password,
  } = req.body;

  db.start.query(
    "SELECT username FROM customer WHERE username = ?",
    [username],
    (error, results) => {
      if (error) {
        console.log(error);
      }
      if (results.length > 0) {
        return res.render("register", {
          message: "That username already in use!",
        });
      } else {
        db.start.query(
          "SELECT account_no, username, password FROM customer WHERE account_no=?",
          [account_no],
          async (error, results) => {
            if (error) {
              console.log(error);
            }
            if (results.length > 0) {
              //if there is an account
              if (!(results[0].username == "" && results[0].password == "")) {
                //if registered
                return res.render("register", {
                  message: "Already registered!",
                });
              } else if (password != conf_password) {
                return res.render("register", {
                  message: "Passwords do not match!",
                });
              } else {
                let hashedPW = await bcrypt.hash(password, 8);
                db.start.query(
                  "UPDATE customer SET ? WHERE account_no = ?",
                  [
                    {
                      name: name,
                      email: email,
                      mobile_no: mobile_no,
                      username: username,
                      password: hashedPW,
                    },
                    account_no,
                  ],
                  (error, results) => {
                    if (error) {
                      console.log(error);
                    } else {
                      return res.render("register", {
                        messageS: "User registered!",
                      });
                    }
                  }
                );
              }
            } else {
              return res.render("register", {
                message: "Account is not available. Please contact us!",
              });
            }
          }
        );
      }
    }
  );
};

//is loggedin
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      db.start.query(
        "SELECT * FROM customer WHERE account_no = ?",
        [decoded.id],
        (error, result) => {
          if (!result) {
            return next();
          }
          // THERE IS A LOGGED IN USER
          req.user = result[0];
          return next();
        }
      );
    } catch (err) {
      return next();
    }
  } else {
    next();
  }
};

//logout
exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).redirect("/");
};
