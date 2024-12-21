const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        first_name: { type: String },
        middle_name: { type: String },
        last_name: { type: String }
    },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String }, 
    bio: { type: String },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team'}]
},
{
    timestamps: true,
});

const User = mongoose.model('User', UserSchema);

module.exports = User;