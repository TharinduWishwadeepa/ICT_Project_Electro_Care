const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const { urlencoded } = require('express');
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload');
dotenv.config({path:'./.env'});
const app = express();
const db = require('./model/db');

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