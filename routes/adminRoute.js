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
    const user = await User.findOneAndUpdate({email:userEmail}, {$inc:{points:points}})
    res.render('admin/reviewSuccess', {submission})
})


router.get('/users', authenticateToken, isAdmin, async (req,res)=> {
    // TODO: uncheck this comment for final prod
    // const users = await User.find({isAdmin:false});
    const users = await User.find({});
    res.render('admin/users', {users})

})

router.post('/users/ban', authenticateToken, isAdmin, async (req,res)=> {
    const {userId} = req.body;
    const user = await User.findByIdAndUpdate(userId, {$set:{isBanned:true}})
    console.log(user)
    res.render('admin/userSuccess', {user, activity:'banned'})
})
router.post('/users/dataClear', authenticateToken, isAdmin, async (req,res)=>{
    const {userId} = req.body;
    const user = await User.findByIdAndUpdate(userId, {$set:{tasks:[], points:0, isBanned:false}})
    res.render('admin/userSuccess', {user, activity:'data cleared'})
})

module.exports=router;