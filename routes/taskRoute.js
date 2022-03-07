const router = require('express').Router();
const { authenticateToken, banCheck } = require('../config/auth');
const Task = require('../models/taskModel');
const Submission = require('../models/submissionModel');
const User = require('../models/userModel');
const Log = require('../models/logModel')

router.get('/:taskId', authenticateToken, banCheck,  async(req,res)=> {
    const { taskId } = req.params;
    const user = req.user
    var ifDue = false
    var ifSubmitted = false
    const task = await Task.findById(taskId)
    // check if task is due and if user has submitted
    try {
        ifDue = task.dueDate > Date.now() ? true : false;
    if (task.submissions.length > 0) {
        for (var i =0; i < task.submissions.length; i++) {
            console.log(task.submissions[i])
            const submission = await Submission.findById(task.submissions[i])
            ifSubmitted = submission.userEmail === user.email ? true : false;
                if (ifSubmitted) {
                    break 
                }
        }
    }
    const submissions = await Submission.find({taskId:taskId})
    res.render('task', {task, user, ifDue, ifSubmitted, submissions})
    } catch (error) {
        console.log(error)
        res.render('error')
    }
    
})

router.post('/submit', authenticateToken , banCheck, (req,res)=> {
    const { taskId, link, notes, userEmail } = req.body;
    const newSubmission = new Submission({
        taskId,
        link,
        notes, 
        userEmail, 
    })
    const getTask = await Task.findById(taskId)
    const newLog = new Log({
        user:req.user, 
        task: getTask,
        pointsChange: 0,
        activity: 'Submitted a task'

    })
    
    newSubmission.save().then(async submission => {
        newLog.save().then(log => {
            const id = submission.id
        const task = await Task.findByIdAndUpdate(taskId, {$push:{submissions:id}})
        const user = await User.findOneAndUpdate({email:userEmail}, {$push:{tasks:task.id}})
        res.render('submitSuccess', {task, user})
        }).catch(error => {
            console.log(error)
            res.render('error')
        })
        
    }
        ).catch(error => {
            console.log(error)
            res.render('error')
        })
})

module.exports = router