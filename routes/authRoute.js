const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const axios = require('axios');


router.get('/login', (req, res) => {
    console.log('login')
    const client_id = process.env.MS_CLIENT_ID 
    const endpoint = process.env.MS_ENDPOINT 
    // ms read user profile scope
    const scope = 'user.read'
    const redirect_uri = process.env.MS_REDIRECT_URI
    const response_type = 'code'
    const link = `${endpoint}?client_id=${client_id}&scope=${scope}&redirect_uri=${redirect_uri}&response_type=${response_type}`
    res.redirect(link)
})

router.get("/callback", (req, res) => {
    console.log('callback')
    const code = req.query.code
    const client_id = process.env.MS_CLIENT_ID
    const client_secret = process.env.MS_CLIENT_SECRET
    const endpoint = process.env.MS_ENDPOINT_TOKEN 
    const redirect_uri = process.env.MS_REDIRECT_URI 
    const grant_type = 'authorization_code'
    const creds = {
        grant_type: grant_type,
        client_id: client_id,
        client_secret: client_secret,
        code: code,
        redirect_uri: redirect_uri,
        scope: 'user.read'
    }
    const params = new URLSearchParams()
    for (const key in creds) {
        params.append(key, creds[key])
    }
    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
    
    axios.post(endpoint, params, config)
        .then(response => {
            const token = response.data.access_token
            
            const configr = {
                headers: {
                    'Authorization': `Bearer ${token}`
            }
            }
            axios.post('https://graph.microsoft.com/oidc/userinfo', null, configr).then(resp=> {
                console.log(resp.data)
                User.findOne({email:resp.data.email}).then(user=> {
                    if (user) {
                        jwt.sign({email:resp.data.email}, process.env.SECRET, (err, token)=> {
                            if (err) throw err 
                            res.cookie('token', token)
                            res.redirect('/dashboard')
                        }).catch(error=> {
                            console.log(error)
                            res.render('error')
                        })
                    } else {
                        const newUser = new User({
                            name:resp.data.name,
                            email:resp.data.email,
                        })
                        newUser.save().then(result=> {
                            jwt.sign({email:resp.data.email}, process.env.SECRET, (err, token)=> {
                                if (err) throw err 
                                res.cookie('token', token)
                                res.redirect('/dashboard')
                            }).catch(error=> {
                                console.log(error)
                                res.render('error')})
                        }).catch(error=> {
                         console.log(error)
                         res.render('error')   
                        })
                    } 
            })
        }).catch
        (error => {
            console.log(error)
            res.render('error')
        }
        )
        
    

    }).catch(err => {
        console.log(err)
        res.render('error')
    }
    )
})

module.exports = router;