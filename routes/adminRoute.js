const { authenticateToken, isAdmin, banCheck } = require('../config/auth');
const Task = require('../models/taskModel');
const router = require('express').Router();
const Submission = require('../models/submissionModel');
const User = require('../models/userModel');
const Log = require('../models/logModel')

router.get('/', authenticateToken, isAdmin, banCheck, async (req, res) => {
    const tasks = await Task.find({});
    res.render('admin/index', { tasks, userInfo: req.user });
})
router.get('/task', authenticateToken, isAdmin, (req, res) => {
    res.render('admin/task', { userInfo: req.user });
})

router.post('/task', authenticateToken, isAdmin, banCheck, (req, res) => {
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
        let taskId = task._id;
        res.render('admin/taskSuccess', { name, description, dueDate, userInfo: req.user, taskId })
    }).catch(err => {
        console.log(err)
        res.render('error')
    })
})

router.post('/review', authenticateToken, isAdmin, banCheck, async (req, res) => {
    const { taskId, comment, points, userEmail } = req.body;
    try {
        const submission = await Submission.findOneAndUpdate({ taskId, userEmail }, { $set: { comment, points, isReviewed: true } })
        await User.findOneAndUpdate({ email: userEmail }, { $inc: { points: points } })
        res.render('admin/reviewSuccess', { submission, userInfo: req.user , taskId})
    } catch (err) {
        console.log(err)
        res.render('error')
    }

})

router.get('/users', authenticateToken, isAdmin, banCheck, async (req, res) => {
    // TODO: uncheck this comment for final prod
    // const users = await User.find({isAdmin:false});
    const users = await User.find({});
    res.render('admin/users', { users, userInfo: req.user })

})

router.post('/users/ban', authenticateToken, isAdmin, banCheck, async (req, res) => {
    const { userId } = req.body;
    // reverse isBanned of user
    const user1 = await User.findById(userId);
    const user = await User.findByIdAndUpdate(userId, { $set: { isBanned: !user1.isBanned } }).catch(err => {
        console.log(err)
        res.render('error')
    })
    res.render('admin/userSuccess', { user, activity: 'banned' })
})
router.post('/users/dataClear', authenticateToken, isAdmin, banCheck, async (req, res) => {
    const { userId } = req.body;
    const user = await User.findByIdAndUpdate(userId, { $set: { tasks: [], points: 0, isBanned: false } }).catch(err => {
        console.log(err)
        res.render('error')
    })
    res.render('admin/userSuccess', { user, activity: 'data cleared' })
})
router.post('/chat', authenticateToken, isAdmin, banCheck, async (req, res) => {
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

router.get('/log', authenticateToken, banCheck, isAdmin, async (req, res) => {
    const logs = await Log.find({}).sort({ date: -1 })
    console.log(logs)
    res.render('admin/log', { logs })
})

module.exports = router;