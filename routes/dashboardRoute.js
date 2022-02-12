const router = require('express').Router();
const { authenticateToken } = require('../config/auth')
const Task = require('../models/taskModel')
const Submission = require('../models/submissionModel')
const User = require('../models/userModel')

router.get('/',authenticateToken, async (req,res)=> { 
    try {
        const userId = req.user.id
        const user = await User.findById(userId)
        const userTasks = user.tasks 
        const openTasks = []
        const closedTasks = []
        const submittedTasks = []
        const reviewedTasks = []
        const allTasks = await Task.find({})
        
        for (var i = 0; i < userTasks.length; i++) {
            var task = await Task.findById(userTasks[i])
            const submission = await Submission.findOne({taskId:task.id, userEmail:user.email})
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
        res.render('dashboard', {openTasks, closedTasks, submittedTasks, reviewedTasks})
    } catch (error) {
        console.log(error)
        res.render('error')
    } 

})
router.get('/userProfile', authenticateToken, (req,res)=>{
    const user = req.user
    res.render('userProfile', {user})

})

module.exports = router;