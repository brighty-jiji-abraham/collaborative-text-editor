// EditAccessModal.jsx
import React, { useState, useEffect } from 'react';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import { getUserSuggestions, getTeamSuggestions, updateAccess } from '../../components/Dashboard/documentService';

const EditAccessModal = ({ isOpen, onClose, documentId, accessToEdit, onAccessUpdated }) => {
    const [accessType, setAccessType] = useState('user'); // Default to user, adjust if needed
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [customUser, setCustomUser] = useState('');
    const [customTeam, setCustomTeam] = useState('');
    const [userSuggestions, setUserSuggestions] = useState([]);
    const [teamSuggestions, setTeamSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [role, setRole] = useState('viewer'); // Default role, can be adjusted

    useEffect(() => {
        if (accessToEdit) {
            if (accessToEdit.memberType === 'User') {
                setAccessType('user');
                setSelectedUser(accessToEdit.memberId);
            } else if (accessToEdit.memberType === 'Team') {
                setAccessType('team');
                setSelectedTeam(accessToEdit.memberId);
            }
            setRole(accessToEdit.role); // Initialize role with current access role
        }
    }, [accessToEdit]);


    const handleEditAccessSubmit = async () => {
        try {
            const updatedAccess = {
                accessId: accessToEdit._id, // Assuming accessToEdit has an _id
                role: role,
            };
            await updateAccess(documentId, updatedAccess); // Assuming updateAccess takes documentId and updatedAccess object
            onAccessUpdated(); // Notify parent component of successful access update
            onClose(); // Close the modal
        } catch (error) {
            setError('Failed to update access');
            console.error("Error updating access:", error);
        }
    };


    const handleRoleChange = (event) => {
        setRole(event.target.value);
    };


    const resetModalState = () => {
        setAccessType('user');
        setSelectedUser(null);
        setSelectedTeam(null);
        setCustomUser('');
        setCustomTeam('');
        setUserSuggestions([]);
        setTeamSuggestions([]);
        setError(null);
        setRole('viewer');
    };


    const handleCloseModal = () => {
        resetModalState();
        onClose();
    };


    return (
        <Modal isOpen={isOpen} onClose={handleCloseModal}>
            <div className="edit-access-form" >
                <label><b>Edit Access</b></label>

                {accessType === 'user' ? (
                    <div>
                        <div>
                            <strong>User:</strong> 
                            <br></br>
                            {accessToEdit?.member?.name?.first_name} {accessToEdit?.member?.name?.middle_name} {accessToEdit?.member?.name?.last_name} ({accessToEdit?.member?.username})
                        </div>
                    </div>
                ) : (
                    <div>
                         <div>
                            <strong>Team:</strong> {accessToEdit?.teamName}
                        </div>
                    </div>
                )}


                <div className="form-group mt-3">
                    <label htmlFor="role"><b>Role:</b></label>
                    <select
                        id="role"
                        className="form-control"
                        value={role}
                        onChange={handleRoleChange}
                    >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                        {/* Add other roles if applicable */}
                    </select>
                </div>


                {error && <div className="alert alert-danger mt-3">{error}</div>}
                <Button text='Update Access' onClick={handleEditAccessSubmit} />
            </div>
        </Modal>
    );
};

export default EditAccessModal;