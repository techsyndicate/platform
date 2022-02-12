const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        required: true,
        default: 0
    },
    submissions: {
        type:Array, 
        required: true,
        default: []
    },
    category: { 
        type: String,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },

    }, {timeStamps: true});

const task = mongoose.model('task', taskSchema);
module.exports = task;