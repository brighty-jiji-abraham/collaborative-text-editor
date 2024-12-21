const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['editor', 'admin', 'member'], required: true },
  },{
    timestamps: true,
  });

const TeamSchema = new mongoose.Schema({
    name: { type: String } ,
    logo: { type: String },
    members: [ userSchema ],
    files: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Files'} ]
},
{
    timestamps: true,
});

const Team = mongoose.model('Team', TeamSchema);

module.exports = Team;