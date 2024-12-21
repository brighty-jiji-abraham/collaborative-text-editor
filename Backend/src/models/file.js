const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  role: { type: String, enum: ['editor', 'admin', 'viewer']},
}, {
  timestamps: true,
});

const FileSchema = new mongoose.Schema({
  title: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  access: [userSchema],
  content: { type: String, required: true },
  type: { type: String, enum: ['personal', 'team'] },
},
  {
    timestamps: true,
  });

const File = mongoose.model('File', FileSchema);

module.exports = File;