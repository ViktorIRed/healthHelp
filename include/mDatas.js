const { Schema, model } = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(require('mongoose'));

const User = new Schema({
    fio: { type: String, required: true },
    avatar: { type: String, required: true },
    number: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    dateReg: { type: String, required: true },
    token: { type: String, required: true },
    pacientID: { type: Array, required: true, default: [] },
    isDoctor: { type: Boolean, required: true },
    doctorID: { type: Number, required: true, default: 0 }
});
const Message = new Schema({
    text: { type: String, required: true },
    senderId: { type: Number, required: true },
    receiverId: { type: Number, required: true },
    createdAt: { type: Number, required: true }
});
User.plugin(AutoIncrement, { inc_field: 'user_id' });
const Users = model('Users', User);
const Messages = model('Messages', Message);
module.exports = { Users, Messages }