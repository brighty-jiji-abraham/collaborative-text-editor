// Modal.jsx
import React from 'react';
import Button from '../../components/Button/Button';
import { FaCircleXmark } from "react-icons/fa6";
import PropTypes from 'prop-types';

const addAccessModel = ({ isOpen, closeModal, accessType, customTeam, customUser, userSuggestions, teamSuggestions, handleAddAccess, handleUserInputChange, handleTeamInputChange }) => {
    if (!isOpen) return null;  // Don't render if the modal is closed

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>Create New {type === 'personal' ? 'Personal' : 'Team'} Document</h2>
                    <Button Name="close-btn" iconComponent={ <FaCircleXmark /> } onClick={closeModal} />
                </div>
                        <div className="add-access-form">
                            <label htmlFor="accessType">Add Access:</label>
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
                                <div>
                                    <label htmlFor="customUser">Enter User:</label>
                                    <input
                                        id="customUser"
                                        type="text"
                                        className="form-control"
                                        value={customUser}
                                        onChange={handleUserInputChange}
                                    />
                                    <ul>
                                        {userSuggestions.map((user) => (
                                            <li key={user._id} onClick={() => setSelectedUser(user._id)}>
                                                {user.name?.first_name} {user.name?.middle_name} {user.name?.last_name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div>
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
                                            <div key={team.id} onClick={() => setSelectedTeam(team)}>
                                                {team.name}
                                            </div>
                                        ))}
                                        <h5>Other Teams</h5>
                                        {teamSuggestions.length > 0 &&  teamSuggestions.otherTeams.map((team) => (
                                            <div key={team.id} onClick={() => setSelectedTeam(team)}>
                                                {team.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                    </ul>
                                </div>
                            )}
                            <Button onClick={handleAddAccess}>Add Access</Button>
                        </div>
            </div>
        </div>
    );
};

export default addAccessModel;

addAccessModel.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    type: PropTypes.oneOf(['personal', 'team']).isRequired,
};