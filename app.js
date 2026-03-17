const express = require('express');
const path = require('path');

const app = express();

// Configuration
const pub = path.join(__dirname, 'public');

// Middleware (modern replacements)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(pub));

// PostProvider
const PostProviderClass = require('./postprovider').PostProvider;
const PostProvider = new PostProviderClass();

// Blog index
app.get('/', function (req, res) {
  PostProvider.findAll(function (error, posts) {
    res.render('index', {
      title: 'Mongo Node.js Blog',
      posts: posts
    });
  });
});

// new
app.get('/posts/new', function (req, res) {
  res.render('post_new', {
    title: 'New Post'
  });
});

// create
app.post('/posts/new', function (req, res) {
  PostProvider.save(
    {
      title: req.body.title,
      body: req.body.body
    },
    function (error, docs) {
      res.redirect('/');
    }
  );
});

// show
app.get('/posts/:id', function (req, res) {
  PostProvider.findById(req.params.id, function (error, post) {
    res.render('post_show', {
      title: post.title,
      post: post
    });
  });
});

// edit
app.get('/posts/:id/edit', function (req, res) {
  PostProvider.findById(req.params.id, function (error, post) {
    res.render('post_edit', {
      title: post.title,
      post: post
    });
  });
});

// update
app.post('/posts/:id/edit', function (req, res) {
  PostProvider.updateById(req.params.id, req.body, function (error, post) {
    res.redirect('/');
  });
});

// add comment
app.post('/posts/addComment', function (req, res) {
  PostProvider.addCommentToPost(
    req.body._id,
    {
      person: req.body.person,
      comment: req.body.comment,
      created_at: new Date()
    },
    function (error, docs) {
      res.redirect('/posts/' + req.body._id);
    }
  );
});

// Start server
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});

module.exports = app;