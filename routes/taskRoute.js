const router = require('express').Router();
const { authenticateToken, banCheck } = require('../config/auth');
const Task = require('../models/taskModel');
const Submission = require('../models/submissionModel');
const User = require('../models/userModel');

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
    newSubmission.save().then(async submission => {
        const id = submission.id
        const task = await Task.findByIdAndUpdate(taskId, {$push:{submissions:id}})
        const user = await User.findOneAndUpdate({email:userEmail}, {$push:{tasks:task.id}})
        res.render('submitSuccess', {task, user})
    }
        ).catch(error => {
            console.log(error)
            res.render('error')
        })
})

module.exports = router