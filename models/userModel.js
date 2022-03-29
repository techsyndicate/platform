const mongoose = require('mongoose');
const boolReqDefFalse = { type: Boolean, required: true, default: false };
const stringReq = { type: String, required: true };
const userSchema = new mongoose.Schema({
    name: stringReq,
    email: stringReq,
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
    isAdmin: boolReqDefFalse,
    isBanned: boolReqDefFalse
    
});

const user = mongoose.model('user', userSchema);
module.exports = user;