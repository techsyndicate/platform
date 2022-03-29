const router = require('express').Router();
const { banCheck } = require('../config/auth')
const Task = require('../models/taskModel')
const Submission = require('../models/submissionModel')
const User = require('../models/userModel')


router.get('/', banCheck, async (req, res) => {
    try {
        const userId = req.user.id
        const user = await User.findById(userId)
        const userTasks = user.tasks
        const openTasks = []
        const userInfo = req.user
        const closedTasks = []
        const submittedTasks = []
        const reviewedTasks = []
        const allTasks = await Task.find({})

        for (var i = 0; i < userTasks.length; i++) {
            let task = await Task.findById(userTasks[i])
            let submissionId = task.submissions[0]
            let submission = await Submission.findById(submissionId)
            if (submission.isReviewed) {
                reviewedTasks.push(task)
            } else {
                submittedTasks.push(task)
            }
        }
        for (var i = 0; i < allTasks.length; i++) {
            task = allTasks[i]

            if (userTasks.includes(task.id.toString())) {
                continue
            } else {
                if (task.dueDate > Date.now()) {
                    openTasks.push(task)
                } else {
                    closedTasks.push(task)
                }

            }
        }

        res.render('dashboard', { openTasks, closedTasks, submittedTasks, reviewedTasks, userInfo })
    } catch (error) {
        console.log(error)
        res.render('error')
    }

})

router.get('/userProfile', banCheck, async (req, res) => {
    const user = req.user
    const userId = req.user.id
    const taskIds = req.user.tasks
    const tasks = []
    for (var i = 0; i < taskIds.length; i++) {
        const taskId = taskIds[i]
        const task = await Task.findById(taskId)
        tasks.push(task)
    }
    res.render('userProfile', { user, tasks, userInfo: user })

})

module.exports = router;