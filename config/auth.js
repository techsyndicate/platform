const jwt = require('jsonwebtoken')
const  User = require('../models/userModel')
module.exports = {
    authenticateToken:  function (req, res,next) {
        const token = req.cookies.token
        if (!token) {
            // token is not there
            return next()
        } else {
            jwt.verify(token, process.env.SECRET, async (err, user)=> {
                // token is there but not valid
                if (err) return next()
            
                User.findOne({email: user.email}).then(user=> {
                    req.user = user
                    return next()
                })
            })
        }
    },
    isAdmin: function (req, res,next) {
        if (req.user.isAdmin) {
            return next()
        } else {
            return res.redirect('/dashboard')
        }
    }, 
    banCheck: function (req,res,next) {
        if (req.user.isBanned) {
            return res.render('banned')
        } else {
            return next()
        }
    }
}