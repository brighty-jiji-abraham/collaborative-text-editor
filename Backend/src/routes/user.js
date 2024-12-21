const express = require('express');
const userRouter = express.Router();
const userController = require('../controllers/userController');
const authverify = require('../middlewear/authverify');

// Create user (signup)
userRouter.post('/signup', userController.createUser);

// Login (Generate JWT token)
userRouter.post('/login', userController.login);

// Check if user is logged in (protected)
userRouter.get('/check', authverify, userController.checkUserLogin);

// Get current user's data (protected)
userRouter.get('/data', authverify, userController.getCurrenUser);

// Get all users (protected)
userRouter.get('/all', authverify, userController.getAllUsers)

// Get user by username (protected)
userRouter.get('/username', authverify, userController.getUserByUsername);

// Get user by ID (protected)
userRouter.get('/:id', authverify, userController.getUserById);

// Update user info (protected)
userRouter.put('/:id', authverify, userController.updateUser);

// Delete user (protected)
userRouter.delete('/:id', authverify, userController.deleteUser);

module.exports = userRouter;