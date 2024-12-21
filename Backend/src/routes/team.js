const express = require('express');
const teamRouter = express.Router();
const teamController = require('../controllers/teamController');
const authverify = require('../middlewear/authverify');

// Create a new team (protected)
teamRouter.post('/', authverify, teamController.createTeam);

// Get all teams (protected)
teamRouter.get('/', authverify, teamController.getAllTeams);

// Search teams
teamRouter.get('/search', authverify, teamController.getTeamSuggestions);

// Get a team by ID (protected)
teamRouter.get('/:teamId', authverify, teamController.getTeamById);

// Update a team (protected)
teamRouter.put('/:teamId', authverify, teamController.updateTeam);

// Delete a team (protected)
teamRouter.delete('/:teamId', authverify, teamController.deleteTeam);

// Add members to a team (protected)
teamRouter.post('/:teamId/members', authverify, teamController.addMembersToTeam);

// Remove members from a team (protected)
teamRouter.delete('/:teamId/members', authverify, teamController.removeMembersFromTeam);

// Remove files from a team (protected)
teamRouter.delete('/:teamId/files', authverify, teamController.removeFilesFromTeam);

// Update member role in a team (protected)
teamRouter.put('/:teamId/members/:memberId', authverify, teamController.updateMemberRoleInTeam);

module.exports = teamRouter;