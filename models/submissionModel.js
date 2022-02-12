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
    comments: { 
        type: Array, 
        required: true,
        default: []
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
    notes: {
        type: String,
        required: true,
        default: ""
    },
    reviewComment: {
        type: String,
    
    }
}, {timestamps: true})

const submission = mongoose.model('submission', taskSchema);
module.exports = submission;