const express = require('express');
const mysql = require('mysql2');
const app = express();
// Create MySQL connection
const connection = mysql.createConnection({
 host: 'localhost',
 user: 'root',
 password: 'Iisssfamily',
 database: 'c237_studentlistapp'
});
connection.connect((err) => {
 if (err) {
 console.error('Error connecting to MySQL:', err);
 return;
 }
 console.log('Connected to MySQL database');
});
// Set up view engine
app.set('view engine', 'ejs');
// enable static files
app.use(express.static('public'));

app.use(express.urlencoded({
    extended: true 
}));

app.get('/', (req, res) => {
    // Example: Fetch all students to display on the home page
    connection.query('SELECT * FROM student', (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.send('Error retrieving students');
        }
        // Assuming you have an 'index.ejs' file in your views folder
        res.render('index', { student: results });
    });
});

app.get('/student/:id', (req, res) => {
    // Extract the student ID from the request parameters
    const studentId = req.params.id;
    const sql = 'SELECT * FROM student WHERE studentId = ?';
    // Fetch data from MySQL based on the student ID
    connection.query( sql , [studentId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.send('Error Retrieving student by ID');
        }
        // Check if any student with the given ID was found
        if (results.length > 0) {
            // Render HTML page with the student data
            res.render('student', { student: results[0] });
        } else {
            // If no student with the given ID was found
            res.send('Student not found');
        }
    });
});

app.get('/addStudent', (req, res) => {
    res.render('addStudent');
});

app.post('/addStudent', (req, res) => {
    // Extract student data from the request body
    const { name, quantity, price, image } = req.body;
    const sql = 'INSERT INTO student (studentName, dob, contact, image) VALUES (?, ?, ?, ?)';
    // Insert the new student into the database
    connection.query( sql , [name, quantity, price, image], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error adding student:", error);
            res.send('Error adding student');
        } else {
            // Send a success response
            res.redirect('/');
        }
    });
});

// 1. GET Route: Display the edit form populated with current student data
app.get('/editStudent/:id', (req, res) => {
    const studentId = req.params.id;
    const sql = 'SELECT * FROM student WHERE studentId = ?';

    // Fetch data from MySQL based on the student ID 
    connection.query(sql, [studentId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.send('Error retrieving student by ID');
        }
        
        // Check if any student with the given ID was found 
        if (results.length > 0) {
            // Render HTML page with the student data 
            res.render('editStudent', { student: results[0] });
        } else {
            // If no student with the given ID was found
            res.send('Student not found');
        }
    });
});

// 2. POST Route: Handle submission of the update form
app.post('/editStudent/:id', (req, res) => {
    const studentId = req.params.id;
    
    // Extract student data from the request body 
    // Note: retaining 'quantity' for dob and 'price' for contact to match your form setup [cite: 5, 6]
    const { name, quantity, price, image } = req.body; 
    
    const sql = 'UPDATE student SET name = ?, dob = ?, contact = ?, image = ? WHERE studentId = ?';

    // Update the student record in the database
    connection.query(sql, [name, quantity, price, image, studentId], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error updating student:", error);
            res.send('Error updating student');
        } else {
            // Send a success response by redirecting to home
            res.redirect('/');
        }
    });
});

// 3. GET Route: Delete a student record
app.get('/deleteStudent/:id', (req, res) => {
    const studentId = req.params.id;
    const sql = 'DELETE FROM student WHERE studentId = ?';

    connection.query(sql, [studentId], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error deleting student:", error);
            res.send('Error deleting student');
        } else {
            // Send a success response by redirecting to home
            res.redirect('/');
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));