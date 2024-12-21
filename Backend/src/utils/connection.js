require('dotenv').config();
const mongoose = require('mongoose');
const { success_message, err_message } = require('../utils/colorcode');

mongoose.connect(process.env.db)
    .then(() => {
        console.log(success_message(`Connected to mongoDB`));
    })
    .catch((err) => {
        console.log(err_message(`Connection to mongoDB failed: ${err}`));
    })