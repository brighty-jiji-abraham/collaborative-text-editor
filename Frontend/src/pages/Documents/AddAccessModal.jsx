// AddAccessModal.jsx
import React, { useState } from 'react';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal.jsx';
import { getUserSuggestions, getTeamSuggestions, addAccess } from '../../components/Dashboard/documentService';
import { BsDisplay } from 'react-icons/bs';

const AddAccessModal = ({ isOpen, onClose, documentId, onAccessAdded }) => {
    const [accessType, setAccessType] = useState('user');
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [customUser, setCustomUser] = useState('');
    const [customTeam, setCustomTeam] = useState('');
    const [userSuggestions, setUserSuggestions] = useState([]);
    const [teamSuggestions, setTeamSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAddAccessSubmit = async () => {
        try {
            const newAccess = {
                userId: accessType === 'user' ? selectedUser : null,
                teamId: accessType === 'team' ? selectedTeam : null,
                role: 'viewer',
            };
            await addAccess(documentId, newAccess);
            onAccessAdded(); // Notify parent component of successful access addition
            onClose(); // Close the modal
        } catch (error) {
            setError('Failed to add access');
            console.error("Error adding access:", error);
        }
    };

    const handleUserInputChange = async (event) => {
        const value = event.target.value;
        setCustomUser(value);

        if (value) {
            setLoading(true);
            try {
                const response = await getUserSuggestions(value);
                if(response.data == null){
                    setUserSuggestions([]);
                }
                else{
                    setUserSuggestions([response.data]);
                }
            } catch (error) {
                setError('Failed to fetch user suggestions');
            } finally {
                setLoading(false);
            }
        } else {
            setUserSuggestions([]);
        }
    };

    const handleTeamInputChange = async (event) => {
        const value = event.target.value;
        setCustomTeam(value);

        if (value) {
            setLoading(true);
            try {
                const response = await getTeamSuggestions(value);
                setTeamSuggestions(response.data);
            } catch (error) {
                setError('Failed to fetch team suggestions');
            } finally {
                setLoading(false);
            }
        } else {
            setTeamSuggestions([]);
        }
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
    };


    const handleCloseModal = () => {
        resetModalState();
        onClose();
    };


    return (
        <Modal isOpen={isOpen} onClose={handleCloseModal}>
            <div className="add-access-form">
                <label htmlFor="accessType"><b>Add Access:</b></label>
                <select
                    id="accessType"
                    className="form-control"
                    value={accessType}
                    onChange={(e) => setAccessType(e.target.value)}
                >
                    <option value="user">User</option>
                    <option value="team">Team</option>
                </select>
                {accessType === 'user' ? (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label htmlFor="customUser">Enter User Name:</label>
                        <input
                            id="customUser"
                            type="text"
                            className="form-control"
                            value={customUser}
                            onChange={handleUserInputChange}
                        />
                        <ul>
                            {userSuggestions.map((user) => (
                                <li key={user._id}
                                    onClick={() => setSelectedUser(selectedUser !== user._id ? user._id : null)}
                                    className={selectedUser === user._id ? "selected" : ""}
                                >
                                    {user.name?.first_name} {user.name?.middle_name} {user.name?.last_name}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label htmlFor="customTeam">Enter Team:</label>
                        <input
                            id="customTeam"
                            type="text"
                            className="form-control"
                            value={customTeam}
                            onChange={handleTeamInputChange}
                        />
                        <ul>
                            <div>
                                <label htmlFor="team">Select Team:</label>
                                <div>
                                    <h5>User Teams</h5>
                                    {teamSuggestions.length > 0 && teamSuggestions.userTeams.map((team) => (
                                        <li key={team._id}
                                            onClick={() => setSelectedTeam(selectedTeam !== team._id ? team._id : null)}
                                            className={selectedTeam === team._id ? "selected" : ""}
                                        >
                                            {team.name}
                                        </li>
                                    ))}
                                    <h5>Other Teams</h5>
                                    {teamSuggestions.length > 0 && teamSuggestions.otherTeams.map((team) => (
                                        <li key={team._id}
                                            onClick={() => setSelectedTeam(selectedTeam !== team._id ? team._id : null)}
                                            className={selectedTeam === team._id ? "selected" : ""}
                                        >
                                            {team.name}
                                        </li>
                                    ))}
                                </div>
                            </div>
                        </ul>
                    </div>
                )}
                {error && <div className="alert alert-danger mt-3">{error}</div>}
                <Button text='Add Access' onClick={handleAddAccessSubmit} />
            </div>
        </Modal>
    );
};

export default AddAccessModal;