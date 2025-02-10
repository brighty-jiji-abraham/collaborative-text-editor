import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaPenToSquare, FaLock, FaRegTrashCan } from "react-icons/fa6";
import { TbUserEdit } from "react-icons/tb";
import { MdPersonRemove } from "react-icons/md";
import { getDocumentById, updateDocument, deleteDocument, removeAccess } from '../../components/Dashboard/documentService';
import { io } from 'socket.io-client';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './documents.css';
import Button from '../../components/Button/Button';
import AddAccessModal from './AddAccessModal';
import EditAccessModal from './EditAccessModal'; // Import EditAccessModal

const Documents = () => {
    const socket = io('http://localhost:3000', { withCredentials: true });
    const { id } = useParams();
    const navigate = useNavigate();
    const [document, setDocument] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isEditable, setIsEditable] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false); // Renamed for clarity
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for Edit Modal
    const [accessToEdit, setAccessToEdit] = useState(null); // State to hold access entry being edited


    const location = useLocation();
    const message = location.state?.message;

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                const response = await getDocumentById(id);
                if (response && response.data) {
                    const doc = response.data;
                    setDocument(doc);
                    setTitle(doc.title);
                    setContent(doc.content);
                    setIsEditable(doc.userRole === 'admin' || doc.userRole === 'editor');
                    setIsAdmin(doc.userRole === 'admin');
                } else {
                    setError('Document not found');
                }
            } catch (error) {
                setError('Failed to fetch document');
            }
        };

        fetchDocument();
    }, [id]);

    useEffect(() => {
        if (!socket) return;

        socket.emit('joinDocument', id);

        socket.on('receiveUpdate', (updatedData) => {
            if (updatedData.title) {
                setTitle(updatedData.title);
            }
            if (updatedData.content) {
                setContent(updatedData.content);
            }
        });

        socket.on('accessAdded', (updatedData) => {
            if (updatedData.documentId === id) {
                fetchDocumentDetails();
            }
        });
        socket.on('accessUpdated', (updatedData) => { // New listener for accessUpdated
            if (updatedData.documentId === id) {
                fetchDocumentDetails(); // Refresh details when access is updated
            }
        });
        socket.on('accessRemoved', (updatedData) => { // New listener for accessRemoved
            if (updatedData.documentId === id) {
                fetchDocumentDetails(); // Refresh details when access is removed
            }
        });


        return () => {
            socket.disconnect();
        };
    }, [id, socket]);

    const fetchDocumentDetails = async () => {
        try {
            const response = await getDocumentById(id);
            if (response && response.data) {
                setDocument(response.data);
            } else {
                setError('Document details not found');
            }
        } catch (error) {
            setError('Failed to fetch document details');
        }
    };


    const openAddModal = () => {
        setIsAddModalOpen(true);
    };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
    };

    const openEditModal = (access) => { // Function to open Edit Modal
        setAccessToEdit(access);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setAccessToEdit(null);
    };

    const handleRemoveAccess = async (accessId, memberId) => {
        const isConfirmed = window.confirm('Are you sure you want to remove this user/team access?');
        if (isConfirmed) {
            try {
                await removeAccess(id, { accessId: accessId }); // Call removeAccess API
                socket.emit('accessRemoved', { documentId: id, accessId: accessId, memberId: memberId }); // Emit socket event
                setSuccessMessage('Access removed successfully!');
                fetchDocumentDetails(); // Refresh document details
            } catch (error) {
                setError('Failed to remove access');
                console.error("Error removing access:", error);
            }
        }
    };


    const handleUpdate = async () => {
        try {
            await updateDocument(id, { title, content });
            socket.emit('documentUpdate', { documentId: id, title, content });
            setSuccessMessage('Document updated successfully!');
            navigate(`/document/${id}`);
        } catch (error) {
            setError('Failed to update document');
        }
    };

    const handleDelete = async () => {
        const isConfirmed = window.confirm('Are you sure you want to delete this document?');
        if (isConfirmed) {
            try {
                await deleteDocument(id);
                navigate('/');
            } catch (error) {
                setError('Failed to delete document');
            }
        }
    };

    const toggleEditableMode = () => {
        setIsReadOnly(prevState => !prevState);
    };

    const handleAccessAdded = () => {
        setSuccessMessage('Access added successfully');
        fetchDocumentDetails();
    };

    const handleAccessUpdated = () => { // New handler for access updated
        setSuccessMessage('Access updated successfully');
        fetchDocumentDetails(); // Refresh document details after updating access
    };


    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!document) return <div className="Loading">Loading...</div>;

    return (
        <div className="content document">
            <div className="header">
                <div className='details'>
                    {message && <div className="alert alert-success mt-3">{message}</div>}
                    <h2 className="headding">{title}</h2>
                    <p>{id}</p>
                </div>
                <div className="actions">
                    {isEditable && (
                        <>
                            {isReadOnly ? (
                                <Button
                                    Name="edit-switch-btn"
                                    onClick={toggleEditableMode}
                                    text="Switch to Editable"
                                    iconComponent={<FaPenToSquare />}
                                />
                            ) : (
                                <Button
                                    Name="edit-switch-btn"
                                    onClick={toggleEditableMode}
                                    text="Switch to Read-Only"
                                    iconComponent={<FaLock />}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
            <div className='document-container'>
                <div className='doc-edit-view'>
                    <div className="form-group">
                        <label htmlFor="title">Title:</label>
                        <input
                            type="text"
                            id="title"
                            className="form-control"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                socket.emit('documentUpdate', { documentId: id, title: e.target.value, content });
                            }}
                            disabled={isReadOnly}
                        />
                    </div>

                    <div className="form-group mt-3">
                        <label htmlFor="content">Content:</label>
                        <ReactQuill
                            value={content}
                            onChange={(value) => {
                                setContent(value);
                                socket.emit('documentUpdate', { documentId: id, title, content: value });
                            }}
                            modules={{
                                toolbar: [
                                    [{ 'header': '1' }, { 'header': '2' }, { 'header': '3' }, { 'font': [] }],
                                    [{ 'size': ['small', 'medium', 'large', 'huge'] }],
                                    [{ 'align': [] }],
                                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                    [{ 'indent': '-1' }, { 'indent': '+1' }],
                                    ['bold', 'italic', 'underline', 'strike'],
                                    ['blockquote', 'code-block'],
                                    ['link', 'image', 'video'],
                                    ['color', 'background'],
                                    [{ 'script': 'sub' }, { 'script': 'super' }],
                                    ['clean'],
                                    ['directionality'],
                                ],
                            }}
                            readOnly={isReadOnly}
                            theme="snow"
                        />
                    </div>

                    {successMessage && <div className="alert alert-success mt-3">{successMessage}</div>}

                    <div className="edit-actions">
                        {isEditable && (
                            <Button
                                Name='success-btn'
                                onClick={handleUpdate}
                                text="Update Document"
                                iconComponent={<FaPenToSquare />}
                                disabled={isReadOnly}
                            />
                        )}
                        {isAdmin && (
                            <Button
                                Name="delete-btn"
                                onClick={handleDelete}
                                text="Delete Document"
                                iconComponent={<FaRegTrashCan />}
                                disabled={isReadOnly}
                            />
                        )}
                    </div>

                </div>
                <div className='doc-details'>
                    <h4>Document Details</h4>
                    <div><strong>Owner:</strong> {document.owner?.name?.first_name} {document.owner?.name?.middle_name} {document.owner?.name?.last_name} ({document.owner?.username})</div>
                    <div><strong>Type:</strong> {document.type}</div>
                    <div><strong>Created At:</strong> {new Date(document.createdAt).toLocaleString()}</div>
                    <div><strong>Updated At:</strong> {new Date(document.updatedAt).toLocaleString()}</div>

                    <h5>Access:</h5>
                    {document.access?.map((access, index) => (
                        <div key={index} className="access-entry">
                            <div>
                                <strong>User:</strong> {access.member?.name?.first_name} {access.member?.name?.middle_name} {access.member?.name?.last_name}
                            </div>
                            <div><strong>Role:</strong> {access.role}</div>
                            {isAdmin && (
                                <div className='access-buttons'>
                                    <Button
                                        Name="edit-access-btn"
                                        text="Edit"
                                        iconComponent={<TbUserEdit />}
                                        onClick={() => openEditModal(access)} // Open Edit modal on click
                                        smallButton={true} // Add a prop for smaller button style if needed
                                    />
                                     <Button
                                        Name="remove-access-btn"
                                        text="Remove"
                                        iconComponent={<MdPersonRemove />}
                                        onClick={() => handleRemoveAccess(access._id, access.member?._id)} // Call handleRemoveAccess
                                        smallButton={true}
                                        />
                                </div>
                            )}
                        </div>
                    ))}
                    {isAdmin && (
                        <div className="add-access-section">
                            <Button text='Add Access' onClick={openAddModal} />
                        </div>
                    )}
                </div>
            </div>

            <AddAccessModal
                isOpen={isAddModalOpen}
                onClose={closeAddModal}
                documentId={id}
                onAccessAdded={handleAccessAdded}
            />
             <EditAccessModal // Render EditAccessModal
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                documentId={id}
                accessToEdit={accessToEdit}
                onAccessUpdated={handleAccessUpdated}
            />
        </div>
    );
};

export default Documents;