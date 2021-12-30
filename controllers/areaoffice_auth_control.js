const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { promisify } = require("util");

const db = require("../model/db");

//login
exports.login = (req, res, next) => {
  try {
    const { area_id, password } = req.body;
    if (!area_id || !password) {
      return res.status(400).render("area_office/login", {
        message: "Please provide the Area ID and password",
        title: "Area Office Login",
      });
    }
    db.start.query(
      "SELECT * FROM areaoffice WHERE area_id = ?",
      [area_id],
      async (error, results) => {
        if (
          !results ||
          !(await bcrypt.compare(password, results[0].password))
        ) {
          res.status(401).render("area_office/login", {
            message: "Area ID or Password is incorrect!",
            title: "Area Office Login",
          });
        } else {
          const id = results[0].area_id;
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
          res.status(200).redirect("/area_office");
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

//is loggedin
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      //  Check if user still exists
      db.start.query(
        "SELECT * FROM areaoffice WHERE area_id = ?",
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
  res.status(200).redirect("/area_office");
};
