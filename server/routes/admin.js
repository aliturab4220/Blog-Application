// Import required modules and models
const express = require('express');
const Router = express.Router();
const Post = require('../models/post');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Define layout and secret for JWT
const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

// Middleware to check if user is authenticated
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  // If no token is present, return unauthorized status
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Verify the token and extract user ID
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    // If token is invalid, return unauthorized status
    res.status(401).json({ message: 'Unauthorized' });
  }
}



// GET route for the admin login page
Router.get('/admin', async (req, res) => {
  try {
    // Set locals for rendering the admin/index page
    const locals = {
      title: 'Admin',
      description: 'Simple blog created with nodejs, express, mongodb'
    }
    // Render the admin/index page with the specified locals and layout
    res.render('admin/index', { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});



// POST route to handle admin login
Router.post('/admin', async (req, res) => {
  try {
    // Extract username and password from the request body
    const { username, password } = req.body;
    // Find a user with the provided username in the database
    const existingUser = await User.findOne({ username });

    // If the user doesn't exist, return an authentication error
    if (!existingUser) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);

    // If the password is invalid, return an authentication error
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // If authentication is successful, generate a JWT token
    const token = jwt.sign({ userId: existingUser._id }, jwtSecret);

    // Set the token as an HTTP-only cookie and redirect to the dashboard
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/dashboard');

  } catch (error) {
    console.log(error);
    // Return a 500 Internal Server Error if an unexpected error occurs
    res.status(500).json({ message: 'Internal server error' });
  }
});



// GET route for the admin dashboard
Router.get('/dashboard', authMiddleware, async (req, res) => {

  try {
    const locals = {
      title: 'Dashboard',
      description: 'simple blog created with nodejs'
    }

    const data = await Post.find();
    // Render the admin/dashboard page
    res.render('admin/dashboard', {
      locals,
      data,
      layout: adminLayout
    });
  } catch (error) {
    console.log(error);
  }
});


// GET route for the admin dashboard to add post
Router.get('/add-post', authMiddleware, async (req, res) => {

  try {
    const locals = {
      title: 'Add Post',
      description: 'simple blog created with nodejs'
    }

    const data = await Post.find();
    // Render the admin/dashboard page
    res.render('admin/add-post', {
      locals,
      layout: adminLayout
    });
  } catch (error) {
    console.log(error);
  }
});


Router.post('/add-post', authMiddleware, async (req, res) => {

  try {

    try {
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body
      });

      await Post.create(newPost);
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
    }

    
  } catch (error) {
    console.log(error);
  }
});

Router.get('/edit-post/:id', authMiddleware, async (req, res) => {
  try {

    const locals = {
      title: "Edit Post",
      description: "Free NodeJs User Management System",
    };

    const data = await Post.findOne({ _id: req.params.id });

    res.render('admin/edit-post', {
      locals,
      data,
      layout: adminLayout
    })

  } catch (error) {
    console.log(error);
  }

});


/**
 * PUT /
 * Admin - Create New Post
*/
Router.put('/edit-post/:id', authMiddleware, async (req, res) => {
  try {

    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now()
    });

    res.redirect(`/edit-post/${req.params.id}`);

  } catch (error) {
    console.log(error);
  }

});


/**
 * DELETE /
 * Admin - Delete Post
*/
Router.delete('/delete-post/:id', authMiddleware, async (req, res) => {

  try {
    await Post.deleteOne( { _id: req.params.id } );
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
  }

});


// POST route to handle user registration
Router.post('/register', async (req, res) => {
  try {
    // Extract username and password from the request body
    const { username, password } = req.body;
    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      // Create a new user in the database
      const newUser = await User.create({ username, password: hashedPassword });
      // Return a success response with the newly created user
      res.status(201).json({ message: 'User Created', user: newUser });
    } catch (error) {
      // If a user with the same username already exists, return a conflict error
      if (error.code === 11000) {
        res.status(409).json({ message: 'User already in use' });
      }
      // Return a 500 Internal Server Error for other unexpected errors
      res.status(500).json({ message: 'Internal server error' });
    }
  } catch (error) {
    console.log(error);
    // Return a 500 Internal Server Error if an unexpected error occurs
    res.status(500).json({ message: 'Internal server error' });
  }
});


/**
 * GET /
 * Admin Logout
*/
Router.get('/logout', (req, res) => {
  res.clearCookie('token');
  //res.json({ message: 'Logout successful.'});
  res.redirect('/');
});

// Export the Router for use in other modules
module.exports = Router;
