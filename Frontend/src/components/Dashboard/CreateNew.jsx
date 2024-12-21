// Modal.jsx
import React from 'react';
import './css/CreateNew.css';
import Button from '../Button/Button';
import { FaCircleXmark } from "react-icons/fa6";
import PropTypes from 'prop-types';

const CreateNew = ({ isOpen, closeModal, onSubmit, type }) => {
    if (!isOpen) return null;  // Don't render if the modal is closed

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>Create New {type === 'personal' ? 'Personal' : 'Team'} Document</h2>
                    <Button Name="close-btn" iconComponent={ <FaCircleXmark /> } onClick={closeModal} />
                </div>
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Document Title</label>
                        <input type="text" id="title" name="title" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="content">Content</label>
                        <textarea id="content" name="content" required></textarea>
                    </div>
                    <div className="form-actions">
                        <Button type="submit" text="Create Document"/>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateNew;

CreateNew.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    type: PropTypes.oneOf(['personal', 'team']).isRequired,
};
