// Load environment variables from a .env file
require("dotenv").config();

const express = require("express");
const expressEjsLayouts = require("express-ejs-layouts");
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');

// Use connect-mongo to store session data in MongoDB
const mongoStore = require('connect-mongo')

// Connect to MongoDB using the connectDB function
const connectDB = require('./server/config/db');
const session = require("express-session");

const app = express();
const port = 5000 || process.env.port;

// Connect to MongoDB
connectDB();

// Parse incoming requests with URL-encoded and JSON payloads
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Parse cookies
app.use(cookieParser());

// Set up session middleware
app.use(session({
  secret: 'keyboard cat', // Secret used to sign the session ID cookie
  resave: false,
  saveUninitialized: true,
  store: mongoStore.create({
    mongoUrl: process.env.MONGODB_URI // MongoDB connection URL from the environment variables
  })
}))

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Use EJS layouts
app.use(expressEjsLayouts);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");

// Use main and admin routes
app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));

// Start the server on the specified port
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
