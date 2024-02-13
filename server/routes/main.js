const express = require('express');
const Router = express.Router();
const Post = require('../models/post');
const { get } = require('mongoose');


// **
// GET
// HOME
// **


Router.get('/', async (req, res) => {
  try {
    const locals = {
      title: 'NodeJs',
      Description: 'Crafting the ultimate blog web application for my project promises an exciting journey. Stay tuned for updates!'
    };

    let perPage = 10;
    let page = parseInt(req.query.page) || 1; // Use parseInt to ensure page is a number

    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * (page - 1)) // Adjusting the skip calculation
      .limit(perPage)
      .exec();

    const count = await Post.countDocuments();
    const nextPage = page + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render('index', {
      locals,
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});




// **
// GET
// POST
// **

Router.get('/post/:id', async (req, res) => {

  try {
    let slug = req.params.id;

    const data = await Post.findById({_id: slug});

    const locals = {
      title: data.title,
      Description: "Crafting the ultimate blog web application for my project promises an exciting journey. Stay tuned for updates!"
    }

    res.render('post', { locals, data });
  } catch (error) {
    console.log(error);
  }

});



// **
// Post
// Search
// **







// function insertPost () {
//   Post.insertMany ([
//     {
//       title: 'Building a Blog',
//       body: 'This is the body text for the first blog post.'
//     },
//     {
//       title: 'Introduction to MongoDB',
//       body: 'In this blog post, we explore the basics of MongoDB.'
//     },
//     {
//       title: 'Node.js Best Practices',
//       body: 'Learn the best practices for writing scalable and maintainable Node.js applications.'
//     },
//     {
//       title: 'Web Development Trends 2024',
//       body: 'Discover the latest trends in web development for the year 2024.'
//     },
//     {
//       title: 'The Future of Artificial Intelligence',
//       body: 'Exploring the potential impact of AI on various industries in the coming years.'
//     },
//     {
//       title: 'Frontend Framework Comparison',
//       body: 'Comparing popular frontend frameworks to help you choose the right one for your project.'
//     },
//     {
//       title: 'Getting Started with Docker',
//       body: 'A step-by-step guide on getting started with Docker for containerized applications.'
//     }
//   ])
// }

// insertPost();



module.exports = Router;