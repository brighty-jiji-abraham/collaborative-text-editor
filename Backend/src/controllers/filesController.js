const File = require('../models/file');
const Team = require('../models/team');
const responseHandler = require('../utils/responseHandler');

// #region Create Personal File
// Upload a new file
exports.createPersonalFile = async (req, res) => {
    try {
        const { title, content } = req.body;
        let { access } = req.body;

        // Validate required fields
        if (!title) {
            return responseHandler(res, 400, 'Title is required.');
        }
        
        // Define the access rights, ensuring the owner is part of the access list
        if (access) {
            // Check if the owner (req.user._id) is already in the access list
            if (!access.some(item => item.member.toString() === req.user._id.toString())) {
                access.push({ member: req.user._id, role: 'admin' });  // Add the owner as 'admin' if not present
            }
        } else {
            // If no access list is provided, create one with the owner as 'admin'
            access = [{ member: req.user._id, role: 'admin' }];
        }

        // Set the owner to be the current authenticated user
        const owner = req.user._id;
        const fileType = 'personal';  // Set file type to 'personal'

        // Create a new file document
        const newFile = new File({
            title,
            content,
            owner,
            access,
            type: fileType,
        });

        // Save the file to the database
        const savedFile = await newFile.save();

        // Return success response with the saved file
        return responseHandler(res, 201, 'File created successfully.', savedFile);
    } catch (err) {
        console.error('Error uploading file:', err.message || err);
        return responseHandler(res, 500, 'Server error. Please try again later.');
    }
};
// #endregion

// #region Create Team File
// Upload a new file
exports.createTeamFile = async (req, res) => {
    try {
        const { title, content, teamId } = req.body;
        let { access } = req.body;

        // Validate required fields
        if (!title && !teamId) {
            return responseHandler(res, 400, 'Title and team ID are required.');
        }

        // Find the team
        const team = await Team.findById(teamId);
        if (!team) {
            return responseHandler(res, 404, 'Team not found.');
        }

        // Check if the current user is an admin or editor of the team
        const currentUserRole = team.members.find(member => member.member.toString() === req.user._id.toString())?.role;
        if (currentUserRole !== 'admin' && currentUserRole !== 'editor') {
            return responseHandler(res, 401, 'You are not authorized to add files. Only admins or editors can add files.');
        }

        // Define the access rights, ensuring the owner is part of the access list
        if (access) {
            // Check if the owner (req.user._id) is already in the access list
            if (!access.some(item => item.member.toString() === req.user._id.toString())) {
                access.push({ member: req.user._id, role: 'admin' });  // Add the owner as 'admin' if not present
            }
            if (!access.some(item => item.team.toString() === teamId.toString())){
                access.push({ team: teamId, role: 'admin' });
            }
        } else {
            // If no access list is provided, create one with the owner as 'admin'
            access = [
                { member: req.user._id, role: 'admin' },
                { team: teamId, role: 'admin' }
            ];
        }

        // Set the owner to be the current authenticated user
        const owner = req.user._id;
        const fileType = 'team'; // Set file type to 'team'

        // Create a new file document
        const newFile = new File({
            title,
            content,
            owner,
            access,
            type: fileType,
        });

        // Save the file to the database
        const savedFile = await newFile.save();
        
        if(!savedFile){
            return responseHandler(res, 500, 'Failed to create file.');
        }

        // Add the created file to the team's files array
        team.files.push(savedFile._id);

        // Save the updated team
        const updatedTeam = await team.save();

        if(!updatedTeam){
            return responseHandler(res, 500, 'Failed to save to team.');
        }

        return responseHandler(res, 201, 'File Created successfully.', savedFile);
    } catch (err) {
        console.error('Error uploading file:', err.message || err);
        return responseHandler(res, 500, 'Server error. Please try again later.');
    }
};
// #endregion

// #region Get All Files
// Get all files (can be extended to check for access control)
exports.getAllFiles = async (req, res) => {
    try {
        // Define the query to filter files
        const userId = req.user._id;
        const files = await File.find({
            $or: [
                // 1. Files where the logged-in user is the owner
                { owner: userId },

                // 2. Files where the user is part of a team with access
                {
                    "access.teamId": { $in: req.user.teams }, 
                },

                // 3. Files where the user has direct access
                {
                    "access.memberId": userId,
                }
            ]
        });

        // Return the files that match the criteria
        return responseHandler(res, 200, 'Files retrieved successfully.', files);
    } catch (err) {
        console.error('Error retrieving files:', err.message || err);
        return responseHandler(res, 500, 'Server error. Please try again later.');
    }
};
// #endregion

// #region Get All Personal Files
// Get all personal files (can be extended to check for access control)
exports.getPersonalFiles = async (req, res) => {
    try {
        // Define the query to filter personal files
        const userId = req.user._id;
        const files = await File.find({ owner: userId, type:'personal' }).sort({ updatedAt: -1 });
        // Return the files that match the criteria
        return responseHandler(res, 200, 'Files retrieved successfully.', files);
    } catch (err) {
        console.error('Error retrieving files:', err.message || err);
        return responseHandler(res, 500, 'Server error. Please try again later.');
    }
};
// #endregion

// #region Get File by ID
// Get a file by ID with access control and populated related fields
exports.getFileById = async (req, res) => {
    try {
        const { fileId } = req.params;

        // Find the file by ID and populate related fields with selected fields
        const file = await File.findById(fileId)
            .populate('owner', 'name username avatar')  // Populate owner with selected fields (name, username, avatar)
            .populate('access.member', 'name username avatar')  // Populate access.members with selected fields (name, username, avatar)
            .populate('access.team', 'name logo')  // Populate access.team with selected fields (name, logo)

        if (!file) {
            return responseHandler(res, 404, 'File not found.');
        }

        // Check if the current user has access to the file
        const hasAccess = file.access.some(permission => {
            const hasPermission = permission.member && permission.member._id.toString() === req.user._id.toString();
            const hasTeamPermission = permission.team && req.user.teams.includes(permission.team._id.toString());
            return hasPermission || hasTeamPermission;  // Access is granted if either member or team has access
        });

        if (!hasAccess) {
            return responseHandler(res, 403, 'Access denied.');
        }

        // Find the role of the current user in the access array
        const userRole = file.access.find(permission =>
            permission.member && permission.member._id.toString() === req.user._id.toString()
        )?.role || null;

        // Add the role to the file data
        const fileWithRole = { ...file.toObject(), userRole };

        return responseHandler(res, 200, 'File retrieved successfully.', fileWithRole);
    } catch (err) {
        console.error('Error retrieving file:', err.message || err);
        return responseHandler(res, 500, 'Server error. Please try again later.');
    }
};
// #endregion

// #region Update File
// Update file information (only by users with 'admin' or 'editor' role)
exports.updateFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const { title, content, access } = req.body;

        // Validate file data
        if (!title && !content && !access) {
            return responseHandler(res, 400, 'No data to update.');
        }

        // Find the file by ID
        const file = await File.findById(fileId);
        if (!file) {
            return responseHandler(res, 404, 'File not found.');
        }

        // Check if the current user has 'admin' or 'editor' role in the file access list
        const userAccess = file.access.find(permission =>
            permission.member?.toString() === req.user._id.toString()
        );
        const teamAccess = file.access.find(permission =>
            req.user.teams.includes(permission.team?.toString())
        );
        if (!userAccess || !['admin', 'editor'].includes(userAccess.role)) {
            if (!teamAccess || !['admin', 'editor'].includes(teamAccess.role)) {
                return responseHandler(res, 403, 'Access denied.');
            }
        }

        // Update file fields
        if (title) file.title = title;
        if (content) file.content = content;
        if (access) file.access = access;

        // Save the updated file
        const updatedFile = await file.save();

        return responseHandler(res, 200, 'File updated successfully.', updatedFile);
    } catch (err) {
        console.error('Error updating file:', err.message || err);
        return responseHandler(res, 500, 'Server error. Please try again later.');
    }
};
// #endregion

// #region Delete File
// Delete a file (only by owner or admin)
exports.deleteFile = async (req, res) => {
    try {
        const { fileId } = req.params;

        // Find the file by ID
        const file = await File.findById(fileId).populate('owner');
        if (!file) {
            return responseHandler(res, 404, 'File not found.');
        }

        // Check if the current user is the owner or has 'admin' role
        if (file.owner._id.toString() !== req.user._id.toString()) {
            const userAccess = file.access.find(permission => permission.member.toString() === req.user._id.toString());
            if (!userAccess || userAccess.role !== 'admin') {
                return responseHandler(res, 403, 'Access denied.');
            }
        }

        // If the file is associated with a team, remove it from the team's `files` array
        if (file.type === 'team') {
            const team = await Team.findOne({ 'files': fileId });
            if (team) {
                // Remove the file from the team's files array
                team.files.pull(fileId);
                await team.save();
            }
        }

        // Delete the file from the File collection
        await File.findByIdAndDelete(fileId);

        return responseHandler(res, 200, 'File deleted successfully.');
    } catch (err) {
        console.error('Error deleting file:', err.message || err);
        return responseHandler(res, 500, 'Server error. Please try again later.');
    }
};
// #endregion

// #region Add User or Team to File Access
// Add user or team to file's access list
exports.addUserOrTeamToAccess = async (req, res) => {
    try {
        const { fileId } = req.params;
        const { userId, teamId, role } = req.body;

        console.log(userId, teamId, role);

        if (!role) {
            return responseHandler(res, 400, 'Role is required.');
        }

        if (!['editor', 'admin', 'viewer'].includes(role)) {
            return responseHandler(res, 400, 'Invalid role.');
        }

        // Find the file by ID
        const file = await File.findById(fileId);
        if (!file) {
            return responseHandler(res, 404, 'File not found.');
        }

        // Check if the current user has 'admin' role to add users or teams to access list
        const userAccess = file.access.find(permission => permission.member.toString() === req.user._id.toString());
        if (!userAccess || userAccess.role !== 'admin') {
            return responseHandler(res, 403, 'Access denied.');
        }

        if (userId) {
            // Add a single user to the access list
            const userAlreadyInAccess = file.access.some(permission => permission.member.toString() === userId.toString());
            if (userAlreadyInAccess) {
                console.log('User is already in the access list.');
                return responseHandler(res, 400, 'User is already in the access list.');
            }
            file.access.push({ member: userId, role });
        } else if (teamId) {
            // Find the team by ID
            const team = await Team.findById(teamId).populate('members.member');
            if (!team) {
                return responseHandler(res, 404, 'Team not found.');
            }

            // Add all team members to the access list
            team.members.forEach(({ member }) => {
                const memberId = member._id.toString();
                const memberAlreadyInAccess = file.access.some(permission => permission.member.toString() === memberId.toString());
                if (!memberAlreadyInAccess) {
                    file.access.push({ member: memberId, role });
                }
            });
        } else {
            return responseHandler(res, 400, 'Either userId or teamId is required.');
        }

        // Save the updated file
        const updatedFile = await file.save();

        return responseHandler(res, 200, 'Access added successfully.', updatedFile);
    } catch (err) {
        console.error('Error adding user or team to access:', err.message || err);
        return responseHandler(res, 500, 'Server error. Please try again later.');
    }
};
// #endregion

// #region Remove File Access Entry by Access ID
// Remove a specific access entry from file's access list using accessId
exports.removeUserOrTeamFromAccess = async (req, res) => {
    try {
        const { fileId } = req.params;
        const { accessId } = req.body; // Expecting accessId in the request body now

        console.log('Remove Access Request:', { fileId, accessId }); // Logging for debugging

        if (!accessId) {
            return responseHandler(res, 400, 'Access ID is required.');
        }

        // Find the file by ID
        const file = await File.findById(fileId);
        if (!file) {
            return responseHandler(res, 404, 'File not found.');
        }

        // Find the index of the access entry to remove based on accessId
        const accessToRemoveIndex = file.access.findIndex(permission => permission._id.toString() === accessId);

        if (accessToRemoveIndex === -1) {
            return responseHandler(res, 404, 'Access entry not found.'); // Access entry with given ID not found
        }

        const accessEntryToRemove = file.access[accessToRemoveIndex]; // **Get the access entry object**

        // Check if the access entry to remove is for the owner, and prevent removal
        if (file.owner.toString() === accessEntryToRemove.member.toString()) { // **Correct owner check**
            return responseHandler(res, 400, 'Cannot remove owner from access list.');
        }


        // Check if the current user has 'admin' role to remove access
        const userAccess = file.access.find(permission => permission.member.toString() === req.user._id.toString());
        if (!userAccess || userAccess.role !== 'admin') {
            return responseHandler(res, 403, 'Access denied. You must be an admin to remove access.');
        }


        // Remove the access entry from the array
        file.access.splice(accessToRemoveIndex, 1); // Remove 1 element at the found index

        // Save the updated file
        const updatedFile = await file.save();

        // Emit socket event to notify clients about access removal (optional, but good for real-time updates)
        if (req.io) { // Assuming you are passing io object in your request
            req.io.to(`document-${fileId}`).emit('accessRemoved', { documentId: fileId, accessId: accessId });
        }


        return responseHandler(res, 200, 'Access removed successfully.', updatedFile);
    } catch (err) {
        console.error('Error removing access:', err.message || err);
        return responseHandler(res, 500, 'Server error. Please try again later.');
    }
};
// #endregion

// #region Edit Access Role for User or Team in File Access
// Edit access role for user or team in file's access list
exports.editAccess = async (req, res) => {
    try {
        const { fileId } = req.params;
        const { accessId, role } = req.body;

        console.log('Edit Access Request:', { fileId, accessId, role });

        if (!accessId) {
            return responseHandler(res, 400, 'Access ID is required.');
        }

        if (!role) {
            return responseHandler(res, 400, 'Role is required.');
        }

        if (!['editor', 'admin', 'viewer'].includes(role)) {
            return responseHandler(res, 400, 'Invalid role.');
        }

        // Find the file by ID
        const file = await File.findById(fileId);
        if (!file) {
            return responseHandler(res, 404, 'File not found.');
        }

        // Check if the current user has 'admin' role to edit access
        const userAccess = file.access.find(permission => permission.member.toString() === req.user._id.toString());
        if (!userAccess || userAccess.role!== 'admin') {
            return responseHandler(res, 403, 'Access denied. You must be an admin to edit access.');
        }

        // Find the specific access entry within the file's access list
        const accessToUpdateIndex = file.access.findIndex(permission => permission._id.toString() === accessId);
        if (accessToUpdateIndex === -1) {
            return responseHandler(res, 404, 'Access entry not found.');
        }

        // Update the role of the access entry
        file.access[accessToUpdateIndex].role = role;

        // Save the updated file
        const updatedFile = await file.save();

        console.log('Access updated successfully.');
        return responseHandler(res, 200, 'Access updated successfully.', updatedFile);
    } catch (err) {
        console.error('Error editing access role:', err.message || err);
        return responseHandler(res, 500, 'Server error. Please try again later.');
    }
};
// #endregion