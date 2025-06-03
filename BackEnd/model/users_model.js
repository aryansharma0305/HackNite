import  mongooose, { model } from 'mongoose';
const userSchema = new mongooose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: false
    },
    role: {
        type: String,
        required: true
    },
    parentEmail: {
        type: String,
        required: false
    },
    parentPhone: {
        type: String,
        required: false
    },
    roomNumber: {
        type: String,
        required: false
    },
    avatarURL: {
        type: String,
        required: false,
        default:" "
    },
    gender: {
        type: String,
        required: false
    },
    dob: {
        type: String,
        required: false
    },
    batch: {
        type: String,
        required: false
    },  
    accesToken: {
        type: String,
        required: false
    },
    
});

export default model('user', userSchema);