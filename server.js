const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const mysql = require('mysql');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route handler for home page
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/about.html");
  });

  // Route handler for home page
app.get('/index.html', (req, res) => {
  res.sendFile(__dirname + "/about.html");
});

// MySQL database configuration
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'learning'
});
connection.connect(function (error) {
  if (error) {
    throw error;
  }
  console.log('Successfully connected to the Database');
})

// Register page
app.get('/register', (req, res) => {
  res.send(`
    <form method="post" action="/register">
      <input type="text" name="username" placeholder="Enter username" required>
      <input type="password" name="password" placeholder="Enter password" required>
      <input type="text" name="role" placeholder="Enter role" required>
      <button type="submit">Register</button>
    </form>
  `);
});

// // Register user
// app.post('/register', (req, res) => {
//   const { username, password } = req.body;

//   // Hash password with bcrypt
//   bcrypt.hash(password, 10, (err, hash) => {
//     if (err) {
//       console.error(err);
//       res.status(500).send('Internal server error');
//     } else {
//       // Insert user data into the database
//       connection.query('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hash], (error, results) => {
//         if (error) {
//           console.error(error);
//           res.status(500).send('Internal server error');
//         } else {
//           res.send('User registered successfully');
//         }
//       });
//     }
//   });
// });

app.post('/signup', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const role = req.body.role;
  console.log(req.body);
    // Hash password
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
        console.error(err);
        res.status(500).send('Internal server error');
      } else {
        // Insert user into database
        const sql = 'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)';
        const values = [username, hash, role];
        connection.query(sql, values, (err, result) => {
          if (err) {
            console.error(err);
            res.status(500).send('Internal server error');
          } else {
            console.log('User signed up:', username);
            res.redirect('/login');
          }
        });
      }
    });
  });
  

// Login page
app.get('/login', (req, res) => {
  res.send(`
    <form method="post" action="/login">
      <input type="text" name="username" placeholder="Enter username" required>
      <input type="password" name="password" placeholder="Enter password" required>
      <button type="submit">Login</button>
    </form>
  `);
});

// Login user
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Get user data from the database
    connection.query('SELECT * FROM users WHERE username = ?', [username], (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send('Internal server error');
      } else if (results.length === 0) {
        res.send('User does not exist');
      } else {
        // Compare password with bcrypt
        bcrypt.compare(password, results[0].password_hash, (err, result) => {
          if (err) {
            console.error(err);
            res.status(500).send('Internal server error');
          } else if (result === false) {
            res.send('Password is incorrect');
          } else {
            res.send('User logged in successfully');
          }
        });
      }
    });
  });

// Start server
app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});