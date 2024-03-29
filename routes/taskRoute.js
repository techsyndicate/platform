const router = require('express').Router();
const { authenticateToken, banCheck } = require('../config/auth');
const Task = require('../models/taskModel');
const Submission = require('../models/submissionModel');
const User = require('../models/userModel');
const Log = require('../models/logModel')
const ObjectId = require('mongoose').Types.ObjectId;

router.get('/:taskId', authenticateToken, banCheck, async (req, res) => {
    const { taskId } = req.params;
    const user = req.user
    var ifDue = false
    var ifSubmitted = false
    var ifReviewed = false
    var points = 0
    var comment = ""
    let description = '';

    if (!ObjectId.isValid(taskId)) {
        return res.render('404')
    }
    const task = await Task.findById(taskId)
    if (!task) {
        return res.render('404')
    }

    // check if task is due and if user has submitted
    try {
        ifDue = task.dueDate > Date.now() ? true : false;
        if (task.submissions.length > 0) {
            for (var i = 0; i < task.submissions.length; i++) {
                const submission = await Submission.findById(task.submissions[i])
                ifSubmitted = submission.userEmail === user.email ? true : false;
                if (ifSubmitted) {
                    ifReviewed = submission.isReviewed ? true : false;
                    task.link = submission.link;
                    description = submission.notes;
                    if (ifReviewed) {
                        comment = submission.comment
                        points = submission.points
                    }
                    break
                }
            }
        }
        const submissions = await Submission.find({ taskId: taskId })
        let messages = await Task.findById(taskId)
        messages = messages["chat"]
        let userMessages = []
        for (message in messages) {
            if (messages[message].userEmail === user.email) {
                userMessages.push(messages[message])
            }
        }
        let dueDate = new Date(task.dueDate)
        dueDate = dueDate.getDate() + "/" + (dueDate.getMonth() + 1) + "/" + dueDate.getFullYear()
        
        res.render('task', { task, user, ifDue, ifSubmitted, submissions, messages, userMessages, ifReviewed, comment, userInfo: req.user, points, description , dueDate})
    } catch (error) {
        console.log(error)
        res.render('error')
    }

})

router.post('/submit', authenticateToken, banCheck, async (req, res) => {
    const { taskId, link, notes, userEmail } = req.body;
    const submission = await Submission.findOne({taskId: taskId, userEmail: userEmail}).catch(err=> {
        console.log(err)
        res.render("error")
    })
    if (submission) {
        // send unathuorized 
        return res.sendStatus(401)
    }

    const getTask = await Task.findById(taskId)

    const newSubmission = new Submission({
        taskId,
        link,
        notes,
        userEmail,
    })

    const newLog = new Log({
        user: req.user,
        task: getTask,
        pointsChange: 0,
        activity: 'Submitted a task'

    })

    newSubmission.save().then(async submission => {
        newLog.save().then(async log => {
            const id = submission.id
            const task = await Task.findByIdAndUpdate(taskId, { $push: { submissions: id } })
            const user = await User.findOneAndUpdate({ email: userEmail }, { $push: { tasks: task.id } })
            res.render('submitSuccess', { task, user })
        }).catch(error => {
            console.log(error)
            res.render('error')
        })
    }).catch(error => {
        console.log(error)
        res.render('error')
    })
})

router.post('/chat', authenticateToken, banCheck, async (req, res) => {
    const { taskId, userEmail, comment } = req.body;
    const task = await Task.findByIdAndUpdate(taskId, { $push: { chat: { userEmail, comment, fromAdmin: false } } }).catch(err => {
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
        res.redirect('/task/' + taskId)
    }).catch(err => {
        console.log(err)
        res.render('error')
    })
})

module.exports = router