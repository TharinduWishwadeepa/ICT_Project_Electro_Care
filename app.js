const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const { urlencoded } = require('express');
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload');
dotenv.config({path:'./.env'});
const app = express();
const db = require('./model/db');
const cron = require('node-cron'); 

//make notification
exports.makeNotification = (notification, callback) => {
    try {
      db.start.query(
        "INSERT INTO notification SET ?",
        [
          {
            type: notification.type,
            title: notification.title,
            description: notification.description,
            notification_to: notification.notification_to,
            notification_from: notification.notification_from,
            link: notification.link,
          },
        ],
        (error, results) => {
          if (!error) {
            return callback(null, "success");
          } else {
            return callback(error, null);
          }
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

//system message - remind to send meter reading
cron.schedule('0 5 28,29,30,31 * *', () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = d.getMonth()+1;
    const before = String(y) + "-" + String(m) + "-" + '01';
    const notification = {
        type: "Submit Meter Reading",
        title: "Submit Your Meter Reading",
        description: `If you have not submitted your meter reading yet, please submit your meter reading before ${before}`,
        notification_to: "Everyone",
        notification_from: "System",
        link: '/upload_image',
    };
    this.makeNotification(notification,(error, results) => {
        if (results == "success") {
            console.log("success");
          } else {
            console.log(error);
          }
    });
});

//start db connect
db.start.connect((error)=>{
    if(error){
        console.log(error)
    }
})
app.set('view engine','ejs');
app.locals.moment = require('moment');

app.use(fileUpload({
    useTempFiles:true
}));

//parse URL encoded bodies (sent by HTML forms)
app.use(express.urlencoded({extended: false}));

//parse JSON bodies (as sent by API clients)
app.use(express.json());

app.use(cookieParser());

//routes
app.use('/',require('./routes/user_pages'));
app.use('/admin',require('./routes/admin_pages'));
app.use('/user_auth',require('./routes/user_auth'));
app.use('/admin/admin_auth',require('./routes/admin_auth'));

//public dir
const publicDir = path.join(__dirname,'./public');
app.use(express.static(publicDir));

app.listen(3000);