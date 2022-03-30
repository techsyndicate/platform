const router = require('express').Router();
const User = require('../models/userModel');
const {checkUser}= require('../config/auth')

router.get('/', (req, res) => {
    res.render('index', { userInfo: req.user })
})

router.get('/leaderboard', checkUser, async (req, res) => {
    console.log(req.user)
    const users = await User.find({ isBanned: false, isAdmin: false }).sort({ points: -1 })
    let user = req.user
    if (user) {
        const rank = users.indexOf(user) + 1
        return res.render('leaderboard', { users, rank, userInfo: user })
    }
    res.render('leaderboard', { users, user })
})

module.exports = router;
