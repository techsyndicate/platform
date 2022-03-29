const { isLoggedIn, isAdmin, banCheck } = require('../config/auth');
const Task = require('../models/taskModel');
const router = require('express').Router();
const Submission = require('../models/submissionModel');
const User = require('../models/userModel');
const Log = require('../models/logModel')

router.get('/', isLoggedIn, isAdmin, banCheck, async (req, res) => {
    const tasks = await Task.find({});
    res.render('admin/index', { tasks, userInfo: req.user });
})
router.get('/task', isLoggedIn, isAdmin, (req, res) => {
    res.render('admin/task', { userInfo: req.user });
})

router.post('/task', isLoggedIn, isAdmin, banCheck, (req, res) => {
    const { name, description, points, category, dueDate } = req.body;
    const task = new Task({
        name,
        description,
        points,
        category,
        dueDate
    })
    task.save().then(task => {
        console.log('Task Added')
        res.render('admin/taskSuccess', { name, description, dueDate })
    }).catch(err => {
        console.log(err)
        res.render('error')
    })
})

router.post('/review', isLoggedIn, isAdmin, banCheck, async (req, res) => {
    const { taskId, comment, points, userEmail } = req.body;
    console.log(comment)
    try {
        const submission = await Submission.findOneAndUpdate({ taskId, userEmail }, { $set: { comment, points, isReviewed: true } })
        const user = await User.findOneAndUpdate({ email: userEmail }, { $inc: { points: points } })
        res.render('admin/reviewSuccess', { submission, userInfo: req.user })
    } catch (err) {
        console.log(err)
        res.render('error')
    }

})

router.get('/users', isLoggedIn, isAdmin, banCheck, async (req, res) => {
    // TODO: uncheck this comment for final prod
    // const users = await User.find({isAdmin:false});
    const users = await User.find({});
    res.render('admin/users', { users, userInfo: req.user })

})

router.post('/users/ban', isLoggedIn, isAdmin, banCheck, async (req, res) => {
    const { userId } = req.body;
    const user = await User.findByIdAndUpdate(userId, { $set: { isBanned: true } }).catch(err => {
        console.log(err)
        res.render('error')
    })
    console.log(user)
    res.render('admin/userSuccess', { user, activity: 'banned' })
})
router.post('/users/dataClear', isLoggedIn, isAdmin, banCheck, async (req, res) => {
    const { userId } = req.body;
    const user = await User.findByIdAndUpdate(userId, { $set: { tasks: [], points: 0, isBanned: false } }).catch(err => {
        console.log(err)
        res.render('error')
    })
    res.render('admin/userSuccess', { user, activity: 'data cleared' })
})
router.post('/chat', isLoggedIn, isAdmin, banCheck, async (req, res) => {
    const { taskId, userEmail, comment } = req.body;
    const task = await Task.findByIdAndUpdate(taskId, { $push: { chat: { userEmail, comment, fromAdmin: true } } }).catch(err => {
        console.log(err)
        res.render('error')
    })
    const user = await User.findOne({ email: userEmail })
    const newLog = new Log({
        user: user,
        task: task,
        pointsChange: 0,
        activity: 'chat'
    }).save().then(doc => {
        console.log(doc)
        res.redirect('/task/' + taskId)
    }).catch(err => {
        console.log(err)
        res.render('error')
    })

})

router.get('/log', isLoggedIn, banCheck, isAdmin, async (req, res) => {
    const logs = await Log.find({}).sort({ date: -1 })
    console.log(logs)
    res.render('admin/log', { logs })
})

module.exports = router;