const Team = require('../models/team');
const User = require('../models/user');
const File = require('../models/file');
const responseHandler = require('../utils/responseHandler');

// #region Create Team
// Create a new team
exports.createTeam = async (req, res) => {
    try {
        const { name, logo, members } = req.body;

        // Check if the team name is provided
        if (!name) {
            return responseHandler(res, 400, 'Team name is required.');
        }

        // Check if members are provided
        if (!members || members.length === 0) {
            let adminuser = {
                member: req.user._id,
                role: 'admin'
            }
            members.push(adminuser);
        }

        // Validate members (make sure all members exist)
        // Extract the member IDs from the `members` array (array of objects)
        const memberIds = members.map(m => m.member);
        const validMembers = await User.find({ '_id': { $in: memberIds } });
        if (validMembers.length !== memberIds.length) {
            return responseHandler(res, 400, 'Some members are invalid.');
        }

        // Ensure the current user is added as 'admin'
        members = members.map(member => {
            // Check if the member is the current user (the one making the request)
            if (member.member.toString() === req.user._id.toString()) {
                return { member: member.member, role: 'admin' }; // Set role to 'admin' if it matches
            } else {
                return { member: member.member, role: 'viewer' }; // Otherwise, set role to 'viewer'
            }
        });

        // Check if the current user (req.user._id) is not already a member of the team
        const isCurrentUserMember = members.some(member => member.member.toString() === req.user._id.toString());

        // If the current user is not a member, add them to the members array as 'admin'
        if (!isCurrentUserMember) {
            members.push({ member: req.user._id, role: 'admin' });
        }

        // Create the team
        const newTeam = new Team({ name, logo, members });

        // Save the team to the database
        const savedTeam = await newTeam.save();

        return responseHandler(res, 201, 'Team created successfully.', savedTeam);
    } catch (err) {
        console.error('Error creating team:', err.message || err);
        return responseHandler(res, 500, 'Server error. Please try again later.');
    }
};
// #endregion

// #region Add Members to Team
// Add members to an existing team
exports.addMembersToTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { members } = req.body;

        if (!members || members.length === 0) {
            return responseHandler(res, 400, 'Members are required.');
        }

        // Find the team
        const team = await Team.findById(teamId);
        if (!team) {
            return responseHandler(res, 404, 'Team not found.');
        }

        // Check if the current user is an admin
        const currentUserMembers = await Team.findById(teamId).select('members');
        const currentMemberIsAdmin = currentUserMembers.some(member => member.member.toString() === req.user._id.toString() && member.role === 'admin');
        if (!currentMemberIsAdmin) {
            return responseHandler(res, 401, 'You are not a member or the admin of the team.');
        }

        // Validate members (make sure all members exist)
        const validMembers = await User.find({ '_id': { $in: members } });
        if (validMembers.length !== members.length) {
            return responseHandler(res, 400, 'Some members are invalid.');
        }

        // Check for duplicate members
        const duplicateMembers = members.filter(memberId =>
            team.members.some(member => member.member.toString() === memberId.toString())
        );
        if (duplicateMembers.length > 0) {
            return responseHandler(res, 400, 'Some members are already in the team.');
        }

        // Add the members to the team with 'viewer' role (or a custom role if needed)
        const newMembers = members.map(memberId => ({ member: memberId, role: 'viewer' }));
        team.members.push(...newMembers);

        // Save the updated team
        const updatedTeam = await team.save();

        // Add the team to the user's teams
        for (let memberId of members) {
            const user = await User.findById(memberId);
            if (user) {
                // Avoid duplicates in the teams array
                if (!user.teams.includes(teamId)) {
                    user.teams.push(teamId);
                    await user.save();
                }
            }
        }

        return responseHandler(res, 200, 'Members added successfully.', updatedTeam);
    } catch (err) {
        console.error('Error adding members to team:', err.message || err);
        return responseHandler(res, 500, 'Server error. Please try again later.');
    }
};
// #endregion

// #region Remove Members from Team
// Remove members from a team
exports.removeMembersFromTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { members } = req.body;

        if (!members || members.length === 0) {
            return responseHandler(res, 400, 'Members to remove are required.');
        }

        // Find the team
        const team = await Team.findById(teamId);
        if (!team) {
            return responseHandler(res, 404, 'Team not found.');
        }

        // Check if the current user is an admin of the team
        const currentUserMembers = await Team.findById(teamId).select('members');
        const currentMemberIsAdmin = currentUserMembers.some(
            member => member.member.toString() === req.user._id.toString() && member.role === 'admin'
        );
        if (!currentMemberIsAdmin) {
            return responseHandler(res, 401, 'You are not an admin of the team.');
        }

        // Validate that the members to be removed are part of the team
        const invalidMembers = members.filter(memberId => !team.members.some(member => member.member.toString() === memberId.toString()));
        if (invalidMembers.length > 0) {
            return responseHandler(res, 400, 'Some members are not part of the team.');
        }

        // Remove the members from the team
        team.members = team.members.filter(member => !members.includes(member.member.toString()));

        // Save the updated team
        const updatedTeam = await team.save();

        // Remove the team from each user's `teams` array
        for (let memberId of members) {
            const user = await User.findById(memberId);
            if (user) {
                // Remove the team from the user's `teams` array
                user.teams = user.teams.filter(teamId => teamId.toString() !== team._id.toString());
                await user.save();
            }
        }

        return responseHandler(res, 200, 'Members removed successfully.', updatedTeam);
    } catch (err) {
        console.error('Error removing members from team:', err.message || err);
        return responseHandler(res, 500, 'Server error. Please try again later.');
    }
};
// #endregion

// #region Update Member Role
// Update a member's role in a team
exports.updateMemberRoleInTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { memberId, role } = req.body;

        // Validate inputs
        if (!memberId || !role) {
            return responseHandler(res, 400, 'Member ID and new role are required.');
        }

        // Check if the role is valid
        const validRoles = ['admin', 'editor', 'viewer'];
        if (!validRoles.includes(role)) {
            return responseHandler(res, 400, `Invalid role. Valid roles are: ${validRoles.join(', ')}.`);
        }

        // Find the team
        const team = await Team.findById(teamId);
        if (!team) {
            return responseHandler(res, 404, 'Team not found.');
        }

        // Check if the current user is an admin of the team
        const currentUserRole = team.members.find(member =>
            member.member.toString() === req.user._id.toString()
        )?.role;
        if (currentUserRole !== 'admin') {
            return responseHandler(res, 403, 'You are not authorized to update member roles. Only admins can perform this action.');
        }

        // Check if the member exists in the team
        const memberToUpdate = team.members.find(member => member.member.toString() === memberId.toString());
        if (!memberToUpdate) {
            return responseHandler(res, 404, 'Member not found in the team.');
        }

        // Update the member's role
        memberToUpdate.role = role;

        // Save the updated team
        const updatedTeam = await team.save();

        return responseHandler(res, 200, 'Member role updated successfully.', updatedTeam);
    } catch (err) {
        console.error('Error updating member role:', err.message || err);
        return responseHandler(res, 500, 'Server error. Please try again later.');
    }
};
// #endregion


// #region Update Team
// Update an existing team
exports.updateTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { name, logo } = req.body;

        // Find the team by ID
        const team = await Team.findById(teamId);
        if (!team) {
            return responseHandler(res, 404, 'Team not found.');
        }

        // Check if the current user is an admin of the team
        const currentUserIsAdmin = team.members.some(member =>
            member.member.toString() === req.user._id.toString() && member.role === 'admin'
        );
        if (!currentUserIsAdmin) {
            return responseHandler(res, 401, 'You are not authorized to update this team. Only admins can update the team.');
        }

        // Update team details
        if (name) team.name = name;

        // Update the logo
        if (logo) team.logo = logo;

        // Save the updated team
        const updatedTeam = await team.save();

        return responseHandler(res, 200, 'Team updated successfully.', updatedTeam);
    } catch (err) {
        console.error('Error updating team:', err.message || err);
        return responseHandler(res, 500, 'Server error. Please try again later.');
    }
};
// #endregion

// #region Get All Teams
// Get all teams
exports.getAllTeams = async (req, res) => {
    try {
        const teams = await Team.find();
        return responseHandler(res, 200, 'Teams retrieved successfully.', teams);
    } catch (err) {
        console.error('Error retrieving teams:', err.message || err);
        return responseHandler(res, 500, 'Server error. Please try again later.');
    }
};
// #endregion

// #region Get Team by ID
// Get a team by ID
exports.getTeamById = async (req, res) => {
    try {
        const { teamId } = req.params;

        // Find the team by ID
        const team = await Team.findById(teamId).populate('members.member').populate('files');
        if (!team) {
            return responseHandler(res, 404, 'Team not found.');
        }

        return responseHandler(res, 200, 'Team retrieved successfully.', team);
    } catch (err) {
        console.error('Error retrieving team:', err.message || err);
        return responseHandler(res, 500, 'Server error. Please try again later.');
    }
};
// #endregion

// #region Delete Team
// Delete a team
exports.deleteTeam = async (req, res) => {
    try {
        const { teamId } = req.params;

        // Find the team by ID
        const team = await Team.findById(teamId);
        if (!team) {
            return responseHandler(res, 404, 'Team not found.');
        }

        // Check if the current user is an admin of the team
        const currentUserIsAdmin = team.members.some(member =>
            member.member.toString() === req.user._id.toString() && member.role === 'admin'
        );
        if (!currentUserIsAdmin) {
            return responseHandler(res, 401, 'You are not authorized to delete this team. Only admins can delete a team.');
        }

        // Delete the team
        await Team.findByIdAndDelete(teamId);

        return responseHandler(res, 200, 'Team deleted successfully.');
    } catch (err) {
        console.error('Error deleting team:', err.message || err);
        return responseHandler(res, 500, 'Server error. Please try again later.');
    }
};
// #endregion

// #region Remove Files from Team
// Remove files from a team and revoke team permissions
exports.removeFilesFromTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { files } = req.body;

        if (!files || !Array.isArray(files) || files.length === 0) {
            return responseHandler(res, 400, 'Files to remove are required and must be an array.');
        }

        // Find the team
        const team = await Team.findById(teamId).populate('files');
        if (!team) {
            return responseHandler(res, 404, 'Team not found.');
        }

        // Check if the current user is an admin or editor of the team
        const currentUserRole = team.members.find(member => member.member.toString() === req.user._id.toString())?.role;
        if (!['admin', 'editor'].includes(currentUserRole)) {
            return responseHandler(res, 403, 'You are not authorized to remove files. Only admins or editors can perform this action.');
        }

        // Fetch the files in bulk to validate existence and access
        const fetchedFiles = await File.find({ _id: { $in: files } });
        const fetchedFileIds = fetchedFiles.map(file => file._id.toString());

        const invalidFiles = files.filter(file => !fetchedFileIds.includes(file));
        if (invalidFiles.length > 0) {
            return responseHandler(res, 404, `Some files do not exist: ${invalidFiles.join(', ')}`);
        }

        // Check file access
        for (const file of fetchedFiles) {
            const accessGranted = file.access.some(access => access.team.toString() === teamId.toString());
            if (!accessGranted) {
                return responseHandler(res, 403, `Access denied for file: ${file.title}`);
            }
        }

        // Remove the files from the team's file list
        team.files = team.files.filter(file => !files.includes(file.toString()));

        // Update files to revoke team permissions
        await Promise.all(
            fetchedFiles.map(file => {
                file.access = file.access.filter(access => access.team.toString() !== teamId.toString());
                return file.save();
            })
        );

        // Save the updated team
        const updatedTeam = await team.save();

        return responseHandler(res, 200, 'Files removed and permissions updated successfully.', {
            updatedFiles: updatedTeam.files,
        });
    } catch (err) {
        console.error('Error removing files from team:', err.message || err);
        return responseHandler(res, 500, 'Server error. Please try again later.');
    }
};
// #endregion

// #region Getting team suggestions
// Getting team suggestions
exports.getTeamSuggestions = async (req, res) => {
    const userId = req.user._id;
    const teamname = req.query.teamname || '';
    // const limit = req.query.limit || 10;
    // const offset = req.query.offset || 0;
    
    try {
        // const teams = await Team.find({'name': { $regex: new RegExp(teamname, 'i') }}).limit(limit).skip(offset);
        const teams = await Team.find({'name': { $regex: new RegExp(teamname, 'i') }});

        // Categorize teams based on whether the user is part of them
        const userTeams = [];
        const otherTeams = [];

        teams.forEach((team) => {
            if (team.members.includes(userId)) {
                // User is part of this team
                userTeams.push(team);
            } else {
                // User is not part of this team
                otherTeams.push(team);
            }
        });

        responseHandler(res, 200, 'Team suggestions retrieved successfully.', {userTeams, otherTeams});
        
    } catch (error) {
        console.error(error);
        responseHandler(res, 500, 'Server error. Please try again later.');
    }
};
// #endregion
