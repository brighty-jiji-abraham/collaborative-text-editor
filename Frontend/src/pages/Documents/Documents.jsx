import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaPenToSquare, FaLock, FaRegTrashCan } from "react-icons/fa6";
import { getDocumentById, updateDocument, deleteDocument, getUserSuggestions, getTeamSuggestions, addAccess, removeAccess } from '../../components/Dashboard/documentService';
import { io } from 'socket.io-client';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './documents.css';
import Button from '../../components/Button/Button';

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
    const [accessType, setAccessType] = useState('user'); // 'user' or 'team'
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [customUser, setCustomUser] = useState('');
    const [customTeam, setCustomTeam] = useState('');
    const [userSuggestions, setUserSuggestions] = useState([]);
    const [teamSuggestions, setTeamSuggestions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

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

        return () => {
            socket.disconnect();
        };
    }, [id, socket]);

    const openModal = () => {
        setIsModalOpen(true);  // Open the modal
    };

    const closeModal = () => {
        setIsModalOpen(false);  // Close the modal
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

    const handleAddAccess = async () => {
        try {
            const newAccess = {
                userId: accessType === 'user' ? selectedUser : null,
                teamId: accessType === 'team' ? selectedTeam : null,
                role: 'viewer',
            };
            await addAccess(id, newAccess);
            setSuccessMessage('Access added successfully');
            socket.emit('accessAdded', { documentId: id, newAccess });
            setSelectedTeam(null);
            setSelectedUser(null);
        } catch (error) {
            setError('Failed to add access');
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
                        <div key={index}>
                            <div><strong>User:</strong> {access.member?.name?.first_name} {access.member?.name?.middle_name} {access.member?.name?.last_name}</div>
                            <div><strong>Role:</strong> {access.role}</div>
                        </div>
                    ))}
                    {isAdmin && (
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
                                <div>
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
                                            <li key={user._id} onClick={() => selectedUser !== user._id ? setSelectedUser(user._id) : setSelectedUser(null)} className={selectedUser === user._id ? "selected" : ""}>
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
                                            <li key={team._id} onClick={() => selectedTeam !== team._id ? setSelectedTeam(team._id) : setSelectedTeam(null)} className={selectedTeam === team._id ? "selected" : ""}>
                                                {team.name}
                                            </li>
                                        ))}
                                        <h5>Other Teams</h5>
                                        {teamSuggestions.length > 0 &&  teamSuggestions.otherTeams.map((team) => (
                                            <li key={team._id} onClick={() => selectedTeam !== team._id ? setSelectedTeam(team._id) : setSelectedTeam(null)} className={selectedTeam === team._id ? "selected" : ""}>
                                                {team.name}
                                            </li>
                                        ))}
                                    </div>
                                </div>
                                    </ul>
                                </div>
                            )}
                            <Button text='Add Access'  onClick={handleAddAccess} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Documents;
