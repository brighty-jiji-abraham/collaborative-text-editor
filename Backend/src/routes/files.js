const express = require('express');
const fileRouter = express.Router();
const fileController = require('../controllers/filesController');
const authverify = require('../middlewear/authverify');

// Create a personal file (protected)
fileRouter.post('/personal', authverify, fileController.createPersonalFile);

// Create a team file (protected)
fileRouter.post('/team', authverify, fileController.createTeamFile);

// Get all files (protected)
fileRouter.get('/', authverify, fileController.getAllFiles);

// Get all personal files (protected)
fileRouter.get('/personal', authverify, fileController.getPersonalFiles);

// Get a file by ID (protected)
fileRouter.get('/:fileId', authverify, fileController.getFileById);

// Update a file (protected)
fileRouter.put('/:fileId', authverify, fileController.updateFile);

// Delete a file (protected)
fileRouter.delete('/:fileId', authverify, fileController.deleteFile);

// Add user to file access (protected)
fileRouter.post('/:fileId/access', authverify, fileController.addUserOrTeamToAccess);

// Remove user from file access (protected)
fileRouter.delete('/:fileId/access', authverify, fileController.removeUserOrTeamFromAccess);

// Edit user access to file (protected)
fileRouter.put('/:fileId/access', authverify, fileController.editAccess);

module.exports = fileRouter;
