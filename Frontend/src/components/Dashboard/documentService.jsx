import axios from 'axios';

// Get a document by its ID
export const getDocumentById = async (id) => {
    const response = await axios.get(`http://localhost:3000/api/files/${id}`, { withCredentials: true });
    return response.data;
};

// Update a document
export const updateDocument = async (id, data) => {
    const response = await axios.put(`http://localhost:3000/api/files/${id}`, data, { withCredentials: true });
    return response.data;
};

// Delete a document
export const deleteDocument = async (id) => {
    const response = await axios.delete(`http://localhost:3000/api/files/${id}`, { withCredentials: true });
    return response.data;
};

// Fetch user suggestions based on the typed input
export const getUserSuggestions = async (query) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/user/username?username=${query}`, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error('Error fetching user suggestions:', error);
    }
};

// Fetch team suggestions based on the typed input
export const getTeamSuggestions = async (query) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/team/search?teamname=${query}`, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error('Error fetching team suggestions:', error);
    }
};

// Add Access
export const addAccess = async (id, data) => {
    try{
        const response = await axios.post(`http://localhost:3000/api/files/${id}/access`, data, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error('Error updating access:', error);
    }
};

// Remove Access
export const removeAccess = async (id, data) => {
    try{
        const response = await axios.delete(`http://localhost:3000/api/files/${id}/access`, data, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error('Error updating access:', error);
    }
};