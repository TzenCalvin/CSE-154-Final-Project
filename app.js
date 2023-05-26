/**
 * Name:
 * Date:
 * Section:
 *
 * Description
 */
'use strict';

const express = require('express');
const app = express();

const multer = require('multer');

const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

app.use(multer().none());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(express.static('public'));
const PORT = process.env.PORT || 8000;
app.listen(PORT);