import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/doc-list.css';
import { FaTrashCan } from "react-icons/fa6";
import Button from '../../components/Button/Button';
import PropTypes from 'prop-types';

const DocumentsList = ({ type }) => {
    const [documents, setDocuments] = useState([]); // Default to an empty array
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const { data } = await axios.get(`http://localhost:3000/api/files/${type}`, {
                    withCredentials: true
                });

                // Log the full response to verify the structure
                console.log('API Response:', data);

                // Ensure the response data is an array of documents inside `data.data`
                if (Array.isArray(data.data)) {
                    setDocuments(data.data); // Set documents correctly
                } else {
                    console.error('Expected an array, but got:', data);
                    setDocuments([]); // Handle unexpected response
                }
            } catch (error) {
                console.error('Failed to fetch documents:', error);
                navigate('/');
            }
        };

        fetchDocuments();
    }, [navigate, type]);

    // Delete document handler with confirmation prompt
    const handleDelete = async (docId) => {
        // Show confirmation prompt
        const isConfirmed = window.confirm("Are you sure you want to delete this document?");
        if (!isConfirmed) {
            return; // If the user cancels, do nothing
        }

        try {
            // Make the DELETE request to the backend API
            const response = await axios.delete(`http://localhost:3000/api/files/${docId}`, {
                withCredentials: true
            });

            // Log response and update the state
            console.log('Document deleted successfully:', response.data);

            // Filter out the deleted document from the state
            setDocuments(documents.filter(doc => doc._id !== docId));
        } catch (error) {
            console.error('Failed to delete document:', error);
        }
    };

    return (
        <div className="container">
            {/* Check if documents is empty */}
            {documents.length === 0 ? (
                <p>No documents available</p>
            ) : (
                <div className="row">
                    {documents.map((doc) => (
                        <div key={doc._id} className="document">
                            <div className="card">
                                <div className="card-body">
                                    <div className='content-preview' dangerouslySetInnerHTML={{ __html: doc.content }} />
                                    <h5 className="card-title">{doc.title}</h5>
                                    <p className="card-text-title">Last updated on: </p>
                                    <p className="card-text-sub">{new Date(doc.updatedAt).toLocaleDateString()} at {new Date(doc.updatedAt).toLocaleTimeString()}</p>
                                    <p className="card-text-title">Created on: </p>
                                    <p className="card-text-sub">{new Date(doc.createdAt).toLocaleDateString()} at {new Date(doc.createdAt).toLocaleTimeString()}</p>
                                    {/* Link to open the document */}
                                    <Link to={`/document/${doc._id}`} className="open">Open Document</Link>
                                    
                                    {/* Delete button */}
                                    <button 
                                        className="delete-btn" 
                                        onClick={() => handleDelete(doc._id)}
                                    >
                                        <FaTrashCan /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

DocumentsList.propTypes = {
    type: PropTypes.string.isRequired
};

export default DocumentsList;
