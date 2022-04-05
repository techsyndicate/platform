const express = require('express')
const ejs = require('ejs')
const path = require('path')
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const https = require('https');
const http = require('http');
const cookieparser = require('cookie-parser')
require('dotenv').config()

const app = express()
const secret = process.env.SECRET
app.set('view engine', 'ejs')
app.use(expressLayouts)
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(cookieparser())
app.use(express.json())

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const indexRoute = require('./routes/indexRoute')
const authRoute = require('./routes/authRoute')
const dashboardRoute = require('./routes/dashboardRoute')
const adminRoute = require('./routes/adminRoute')
const taskRoute = require('./routes/taskRoute')

//cert options
const options = {
    key: Buffer.from(process.env.PVT_KEY, 'base64').toString(),
    cert: Buffer.from(process.env.CERT, 'base64').toString(),
    ca: Buffer.from(process.env.INT_CERT, 'base64').toString()
}

let httpsServer = https.createServer(options, app);
let httpServer = http.createServer(app);

app.use((req, res, next) => {
    console.log(`https://${req.headers.host}${req.url}`)
    // if http send to https
    if (req.protocol === 'http') {
        return res.redirect(301, `https://${req.headers.host}${req.url}`)
    }
    next();
})

app.use(authRoute)
app.use(indexRoute)
app.use('/dashboard', dashboardRoute)
app.use('/admin', adminRoute)
app.use('/task', taskRoute)

// 404 page
app.use((req, res, next) => {
    res.render('404')
})

const pass = process.env.MONGO_PASS
const port = process.env.PORT || 443
const port1 = process.env.PORT1 || 80

mongoose.connect(`mongodb+srv://techsyndicate:${pass}@cluster0.pbyaj.mongodb.net/data?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))

httpsServer.listen(port, () => console.log(`Server started on port ${port}`))
httpServer.listen(port1, () => console.log(`Server started on port ${port1}`))