require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const responseHandler = require('../utils/responseHandler');

// #region Create User
// Create a new user (signup)
exports.createUser = async (req, res) => {
  try {
    console.log(req.body);
    
    const data = req.body;
    if (!data.username && !data.email){
      return responseHandler(res, 400, 'Username and email is required.');
    }

    const email = data.email;
    const username = data.username;

    // Check if the username or email already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return responseHandler(res, 400, 'Username or email already exists.');
    }

    // Hash the password before saving it to the database
    if(!data.password){
      return responseHandler(res, 500, 'password is required.');
    }

    const password = data.password;
    const hashedPassword = await bcrypt.hash(password, 12);
    if(!data.first_name){
      return responseHandler(res, 400, 'first name is required.');
    }
    const first_name = data.first_name;
    const middle_name = data.middle_name || '';
    const last_name = data.last_name || '';

    data.name = { first_name, middle_name, last_name };
    data.password = hashedPassword;
    
    const newUser = new User(data);

    // Save the user
    const savedUser = await newUser.save();

    return responseHandler(res, 201, 'User created successfully.', savedUser);
  } catch (err) {
    console.error('Error creating user:', err.message || err);
    return responseHandler(res, 500, 'Server error. Please try again later.');
  }
};
// #endregion

// #region Get All Users
// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return responseHandler(res, 200, 'Users retrieved successfully.', users);
  } catch (err) {
    console.error('Error retrieving users:', err.message || err);
    return responseHandler(res, 500, 'Server error. Please try again later.');
  }
}
// #endregion

// #region Check User login
// Check User login
exports.checkUserLogin = async (req, res) => {
  try {
    return responseHandler(res, 200, 'User is logged in');
  }
  catch (err) {
    console.error('Error checking user login:', err.message || err);
    return responseHandler(res, 500, 'Server error. Please try again later.');
  }
}
// #endregion

// #region Get User ID
// Get a user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the user by their ID
    const user = await User.findById(id);
    if (!user) {
      return responseHandler(res, 404, 'User not found.');
    }

    return responseHandler(res, 200, 'User retrieved successfully.', user);
  } catch (err) {
    console.error('Error getting user:', err.message || err);
    return responseHandler(res, 500, 'Server error. Please try again later.');
  }
};
// #endregion

// #region Get User Username
// Get a user by username
exports.getUserByUsername = async (req, res) => {
  try {
    const { username } = req.query;

    // Find the user by their username (not by _id)
    const user = await User.findOne({ 
      username: { $regex: new RegExp(username, 'i') } 
    }).select('username name avatar _id');

    return responseHandler(res, 200, 'User retrieved successfully.', user);
  } catch (err) {
    console.error('Error getting user:', err.message || err);
    return responseHandler(res, 500, 'Server error. Please try again later.');
  }
};
// #endregion

// #region Update User
// Update a user's information
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, middle_name, last_name, username, email, avatar, bio } = req.body;

    // Find the user by their ID
    const user = await User.findById(id);
    if (!user) {
      return responseHandler(res, 404, 'User not found.');
    }

    // If the email or username is being changed, check if they are already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return responseHandler(res, 400, 'Email already exists.');
      }
    }
    
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return responseHandler(res, 400, 'Username already exists.');
      }
    }

    // Update the user's fields
    user.Name.first_name = first_name || user.Name.first_name;
    user.Name.middle_name = middle_name || user.Name.middle_name;
    user.Name.last_name = last_name || user.Name.last_name;
    user.username = username || user.username;
    user.email = email || user.email;
    user.avatar = avatar || user.avatar;
    user.bio = bio || user.bio;

    // Save the updated user
    const updatedUser = await user.save();

    return responseHandler(res, 200, 'User updated successfully.', updatedUser);
  } catch (err) {
    console.error('Error updating user:', err.message || err);
    return responseHandler(res, 500, 'Server error. Please try again later.');
  }
};
// #endregion

// #region Delete User
// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the user by ID
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return responseHandler(res, 404, 'User not found.');
    }

    return responseHandler(res, 200, 'User deleted successfully.');
  } catch (err) {
    console.error('Error deleting user:', err.message || err);
    return responseHandler(res, 500, 'Server error. Please try again later.');
  }
};
// #endregion

// #region Login User
// Login (Generate JWT token)
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ username: username });
    if (!user) {
      return responseHandler(res, 404, 'User not found.');
    }

    // Compare password with hashed password in the DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return responseHandler(res, 400, 'Invalid credentials.');
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Set the secuired cookie
    res.cookie('authToken', token, {
      httpOnly: true, // Makes the cookie inaccessible to JavaScript
      secure: true, // Use secure cookies in production (https)
      sameSite: 'Strict', // Mitigates CSRF attacks
      maxAge: 3600000, // Cookie expiry in milliseconds (1 hour)
      path: '/' // Cookie accessible across the entire domain
    });

    return responseHandler(res, 200, 'Login successful.', { token });
  } catch (err) {
    console.error('Error during login:', err.message || err);
    return responseHandler(res, 500, 'Server error. Please try again later.');
  }
};
// #endregion

// #region Get current user details
// Get current user
exports.getCurrenUser = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return responseHandler(res, 401, 'Unauthorized.');
    }
    let reconstructedUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      name: user.name
    }
    return responseHandler(res, 200, 'User details retrieved.', reconstructedUser);
  } catch (err) {
    console.error('Error during getting current user:', err.message || err);
    return responseHandler(res, 500, 'Server error. Please try again later.');
  }
}
// #endregion