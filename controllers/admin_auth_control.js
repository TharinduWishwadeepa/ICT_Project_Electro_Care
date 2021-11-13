const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');

const db = require('../model/db');

//login
exports.login = (req, res, next)=>{
    try {
        const {username, password} = req.body;
        if(!username || !password){
            return res.status(400).render('admin/login',{
                message:"Please provide the username and password",
                title: 'Admin Login',
            })
        }
        db.start.query('SELECT * FROM admin WHERE username = ?',[username], async (error, results)=>{
            if(!results || !(await bcrypt.compare(password, results[0].password))){
                res.status(401).render('admin/login',{
                    message:"Username or Password is incorrect!",
                    title: 'Admin Login',
                })
            }
            else{
                const id = results[0].id;
                const token = jwt.sign({id},process.env.JWT_SECRET,{
                    expiresIn:process.env.JWT_EXPIRES_IN
                });
                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
                    ),
                    httpOnly:true
                }
                res.cookie('jwt',token, cookieOptions);
                res.status(200).redirect('/admin');
            }
        })
    } catch (error) {
        console.log(error);
    }
}

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
        db.start.query('SELECT * FROM admin WHERE id = ?', [decoded.id], (error, result) => {
          if(!result) {
            return next();
          }
          // THERE IS A LOGGED IN USER
          req.user = result[0];
          return next();
        });
      } catch (err) {
        return next();
      }
    } else {
      next();
    }
  };

  //logout
  exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });
    res.status(200).redirect("/admin");
  };