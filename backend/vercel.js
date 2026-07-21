const express = require('express');
const server = require('./src/server');

const app = express();

server(app);

module.exports = app;
