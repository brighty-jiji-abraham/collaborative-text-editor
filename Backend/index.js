// Import dependencies
require('dotenv').config();
require('./src/utils/connection'); // Mongoose connection
const { default_message, links_message } = require('./src/utils/colorcode');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const responseHandler = require('./src/utils/responseHandler');
const http = require('http');
const socketIo = require('socket.io');

const userRouter = require('./src/routes/user');
const fileRouter = require('./src/routes/files');
const teamRouter = require('./src/routes/team');

// Create Express app
const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

// Enable CORS for all origins
app.use(cookieParser()); // Middleware to parse cookies
app.use(cors({
  origin: 'http://localhost:5173', // This allows all origins
  credentials: true, // Allow credentials (cookies) to be sent with requests
}));

// Use the user routes
app.use('/api/user', userRouter);
app.use('/api/files', fileRouter);
app.use('/api/team', teamRouter);

app.get('*', (req, res) => {
  return responseHandler(res, 200, "Uh-oh, looks like you've ventured into the API wilderness! This is uncharted territory. Let's head back to safer grounds.");
});

// #region Socket.IO setup
const server = http.createServer(app); // Create the HTTP server

// Add CORS configuration for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5173', // The frontend's URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true, // Allow credentials (cookies) to be sent
  }
});

// Handle Socket.IO connections
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('joinDocument', (documentId) => {
    socket.join(documentId);
    console.log(`User joined document ${documentId}`);
  });

  socket.on('documentUpdate', ({ documentId, title, content }) => {
    socket.to(documentId).emit('receiveUpdate', { title, content });
    console.log(`Received update for document ${documentId}`);
    console.log({ title, content });
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('a user disconnected');
  });
});

// #region Listener
server.listen(port, () => {
  console.log(default_message(`server running on port `), links_message(`http://localhost:${port}/`));
});
