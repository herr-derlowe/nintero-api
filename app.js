const express = require('express');
const morgan = require('morgan');
const app = express();
const body_parser = require('body-parser');
const mongoose = require('mongoose');

require('dotenv').config();

// setting up api routes variables
const userRoutes = require('./src/routes/users');
const categoriesRoutes = require('./src/routes/categories');
const validatorRoutes = require('./src/routes/validators');
const articleRoutes = require('./src/routes/articles');
const gameRoutes = require('./src/routes/games');
const requestRoutes = require('./src/routes/request');

mongoose.connect(process.env.MONGODB_URI, { dbName: 'ninterodb' });

app.use(morgan('dev'));
app.use(body_parser.urlencoded({extended: false}));
app.use(body_parser.json());

app.use((req, res, next) => {
    // Allowed origin of requests, currently open for all
    res.header("Access-Control-Allow-Origin", "*");
    
    res.header(
        "Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

// API routes
app.use('/api/users/', userRoutes);
app.use('/api/categories/', categoriesRoutes);
app.use('/api/validators/', validatorRoutes);
app.use('/api/articles/', articleRoutes);
app.use('/api/games/', gameRoutes);
app.use('/api/request/', requestRoutes);

//app.use('/api/category', (req,res,next)=>res.json({text: "prueba"}));

// Handle all routes not defined
app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

// Handle all other errors as server side
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

/**
 * Main application module using express
 * @module app/express
*/
module.exports = app;