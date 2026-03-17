const express = require('express');
const path = require('path');

const app = express();

// Config
const pub = path.join(__dirname, 'public');

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
    if (error) {
      return res.status(500).send("Internal Server Error");
    }

    res.render('index', {
      title: 'Mongo Node.js Blog',
      posts: posts
    });
  });
});

// New post page
app.get('/posts/new', function (req, res) {
  res.render('post_new', {
    title: 'New Post'
  });
});

// Create post
app.post('/posts/new', function (req, res) {
  PostProvider.save(
    {
      title: req.body.title,
      body: req.body.body
    },
    function (error, docs) {
      if (error) {
        return res.status(500).send("Error saving post");
      }
      res.redirect('/');
    }
  );
});

// Show post
app.get('/posts/:id', function (req, res) {
  PostProvider.findById(req.params.id, function (error, post) {
    if (error || !post) {
      return res.status(404).send("Post not found");
    }

    res.render('post_show', {
      title: post.title,
      post: post
    });
  });
});

// Edit page
app.get('/posts/:id/edit', function (req, res) {
  PostProvider.findById(req.params.id, function (error, post) {
    if (error || !post) {
      return res.status(404).send("Post not found");
    }

    res.render('post_edit', {
      title: post.title,
      post: post
    });
  });
});

// Update post
app.post('/posts/:id/edit', function (req, res) {
  PostProvider.updateById(req.params.id, req.body, function (error, post) {
    if (error) {
      return res.status(500).send("Error updating post");
    }
    res.redirect('/');
  });
});

// Add comment
app.post('/posts/addComment', function (req, res) {
  PostProvider.addCommentToPost(
    req.body._id,
    {
      person: req.body.person,
      comment: req.body.comment,
      created_at: new Date()
    },
    function (error, docs) {
      if (error) {
        return res.status(500).send("Error adding comment");
      }
      res.redirect('/posts/' + req.body._id);
    }
  );
});

// Start server
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;