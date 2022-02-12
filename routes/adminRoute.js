const { isAdmin, authenticateToken } = require('../config/auth');
const Task = require('../models/taskModel');
const router = require('express').Router();
const Submission = require('../models/submissionModel');
const User = require('../models/userModel');

router.get('/',authenticateToken, isAdmin, async (req, res) => {
    const tasks = await Task.find({});
    res.render('admin/index', {tasks})
})
router.get('/task', authenticateToken, isAdmin, (req, res) => {

    res.render('admin/task')
})

router.post('/task', authenticateToken, isAdmin, (req, res) => {
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
        res.render('admin/taskSuccess', {name, description, dueDate})
    })
})

router.post('/review', authenticateToken, isAdmin, async (req,res)=> {
    const { taskId, reviewComment, points, userEmail } = req.body;
    const submission = await Submission.findOneAndUpdate({taskId, userEmail}, {$set:{reviewComment, points, isReviewed:true}})
    res.render('admin/reviewSuccess', {submission})
})



module.exports=router;