const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    userEmail: {
        type: String, 
        required: true,
    },
    taskId: {
        type: String,
        required: true,
    }, 
    link: {
        type: String,
        required: true,
    }, 
    
    points: {
        type: Number,
        required:true, 
        default: 0
    },
    isReviewed: {
        type: Boolean,
        required: true,
        default: false
    },
    comment: {
        type: String,
    
    }
}, {timestamps: true})

const submission = mongoose.model('submission', taskSchema);
module.exports = submission;