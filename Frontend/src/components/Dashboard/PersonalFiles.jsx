import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '../Button/Button';
import DocumentsList from './DocumentsList';
import CreateNew from './CreateNew';
import { FaFileCirclePlus } from "react-icons/fa6";
import './css/personal.css';

const PersonalFiles = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [message, setMessage] = useState('');  // State to handle feedback messages
    const navigate = useNavigate();

    const openModal = () => {
        setIsModalOpen(true);  // Open the modal
    };

    const closeModal = () => {
        setIsModalOpen(false);  // Close the modal
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const title = formData.get('title');
        const content = formData.get('content');

        const data = {
            title: title,
            content: content
        };

        try {
            // Send POST request to the backend to create a personal file
            const response = await axios.post('http://localhost:3000/api/files/personal', data, {
                withCredentials: true,  // Send credentials for authentication
            });

            if (response.status === 201) {
                // Success handling
                setMessage('Document created successfully!');
                console.log(response.data);  // Optionally log the response from the backend
                // Redirect or update the documents list
                navigate(`/document/${response.data.data._id}`);
            }
        } catch (error) {
            // Error handling
            console.error('Error creating personal file:', error.response ? error.response.data : error.message);
            setMessage('An error occurred while creating the document.');
        }

        // Close the modal after form submission
        closeModal();
    };

    return (
        <>
            <div className="personal-files">
                <div className="header">
                    <h2>Personal Files</h2>
                    <div className="create-doc-button">
                        <Button text="New Document" onClick={openModal} iconComponent={<FaFileCirclePlus /> }/>
                    </div>
                </div>

                {/* Display success or error message */}
                {message && <div className="alert alert-info">{message}</div>}

                {/* Display the modal if isModalOpen is true */}
                <CreateNew isOpen={isModalOpen} closeModal={closeModal} onSubmit={handleFormSubmit} type="personal" />

                <DocumentsList type="personal" />
            </div>
        </>
    );
};

export default PersonalFiles;
