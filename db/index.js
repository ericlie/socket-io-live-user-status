const express = require('express');
const bodyParser = require('body-parser');
const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');

// Create server
const app = express();
app.use(bodyParser.json());

// Create database instance and start server
const adapter = new FileAsync('data.json');
low(adapter)
  .then((db) => {
    // Routes
    app.get('/users', (req, res) => {
      const users = db.get('users');
      res.send({ users });
    });
    // GET /users/:id
    app.get('/users/:id', (req, res) => {
      const user = db.get('users')
        .find({ id: req.params.id })
        .value();

      res.send(user);
    });

    // POST /users
    app.post('/users', (req, res) => {
      db.get('users')
        .push(req.body)
        .last()
        .assign({ id: Date.now().toString() })
        .write()
        .then(user => res.send(user));
    });

    // PUT /users/:id
    app.put('/users/:id', (req, res) => {
      const user = db.get('users')
        .find({ id: req.params.id })
        .assign({
          status: req.body.status,
        })
        .value();

      res.send(user);
    });

    // Set db default values
    return db.defaults({ posts: [] }).write();
  })
  .then(() => {
    app.listen(3000, () => console.log('listening on port 3000'));
  });
