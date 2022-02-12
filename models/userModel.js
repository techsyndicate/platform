const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    tasks: {
        type: Array,
        required:true,
        default:[]
    },
    points: {
        type: Number,
        required: true,
        default: 0
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    }
    
});

const user = mongoose.model('user', userSchema);
module.exports = user;