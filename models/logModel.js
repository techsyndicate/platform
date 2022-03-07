const mongoose = require('mongoose')

const logSchema = new mongoose.Schema({
    user: {
        type: Object,
        required: true
    },
    task: {
        type: Object,
        required: true
    },
    pointsChange: {
        type: Number,
        required: true
    },
    activity: {
        type: String,
        required: true
    }}, 
    {timestamps:true}
)
const log = mongoose.model('log', logSchema)
module.exports = log

        