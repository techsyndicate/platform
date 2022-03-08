const router = require('express').Router();
const User = require('../models/userModel');

router.get('/', (req, res) => {
    res.render('index')
})
router.get('/leaderboard', async (req,res)=> {
const users = await User.find({isBanned:false, isAdmin:false}).sort({points:-1})
if (req.user) {
    const user = req.user 
    const rank = users.indexOf(user) + 1
    res.render('leaderboard', {users, rank, user})
}
res.render('leaderboard', {users})
})
module.exports = router;