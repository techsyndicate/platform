const express = require('express')
const ejs = require('ejs')
const path = require('path')
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const https = require('https')
const http = require('http')

const cookieparser = require('cookie-parser')
require('dotenv').config()

const app = express()
const secret = process.env.SECRET
app.set('view engine', 'ejs')
app.enable('trust proxy')
app.use(expressLayouts)
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(cookieparser())
app.use(express.json())

app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

const indexRoute = require('./routes/indexRoute')
const authRoute = require('./routes/authRoute')
const dashboardRoute = require('./routes/dashboardRoute')
const adminRoute = require('./routes/adminRoute')
const taskRoute = require('./routes/taskRoute')

app.use(authRoute)
app.use(indexRoute)
app.use('/dashboard', dashboardRoute)
app.use('/admin', adminRoute)
app.use('/task', taskRoute)

const pass = process.env.MONGO_PASS 
const pvt_key = Buffer.from(process.env.PVT_KEY, 'base64').toString('ascii')
const cert = Buffer.from(process.env.CERT, 'base64').toString('ascii')
const port = process.env.PORT || 5000
mongoose.connect(`mongodb+srv://techsyndicate:${pass}@cluster0.pbyaj.mongodb.net/data?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
    }).then(() => console.log('Connected to MongoDB'))
// app.listen(port, () => console.log(`Server started on port ${port}`))
const options = {
    key: pvt_key,
    cert: cert
}
http.createServer(app).listen(port, () => console.log(`Server started on port ${port}`))
https.createServer(options, app).listen(3000, () => console.log(`Server started on port 3000`))
app.get('*',function(req,res,next){
    if(req.headers['x-forwarded-proto'] != 'https'){
      res.redirect('https://platform.techsyndicate.us'+req.url);
    } else next();
  });

// 404 page
app.use((req, res, next) => {
    res.render('404')
})