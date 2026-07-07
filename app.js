const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const app = express();

// ==========================================
// 1. Database Connection
// ==========================================
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

// ==========================================
// 2. Middleware & View Engine Setup
// ==========================================
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 3. Multer Configuration (Image Uploads)
// ==========================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images'); 
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); 
    }
});

const upload = multer({ storage: storage });

// ==========================================
// 4. Routes (CRUD Operations)
// ==========================================

// READ: Display all students on the index page
app.get('/', (req, res) => {
    connection.query('SELECT * FROM student', (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.send('Error retrieving students');
        }
        // FIXED: Changed key 'student' to 'students' to match index.ejs loop
        res.render('index', { students: results });
    });
});

// READ: Display specific student by ID
app.get('/student/:id', (req, res) => {
    const studentId = req.params.id;
    const sql = 'SELECT * FROM student WHERE studentId = ?';
    
    connection.query(sql, [studentId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.send('Error Retrieving student by ID');
        }
        
        if (results.length > 0) {
            res.render('student', { student: results[0] });
        } else {
            res.send('Student not found');
        }
    });
});

// CREATE: Render the add student form
app.get('/addStudent', (req, res) => {
    res.render('addStudent');
});

// CREATE: Process the add student form
app.post('/addStudent', upload.single('image'), (req, res) => {
    // FIXED: Extracted fields matching addStudent.ejs input fields (dob, contact)
    const { name, dob, contact } = req.body; 
    let image = req.body.image; 
    
    // If a file was uploaded via multer, use that filename instead
    if (req.file) {
        image = req.file.originalname; 
    }

    // Ensure table columns match your DB schema (using 'name' here to align with EJS placeholders)
    const sql = 'INSERT INTO student (name, dob, contact, image) VALUES (?, ?, ?, ?)';
    
    connection.query(sql, [name, dob, contact, image], (error, results) => {
        if (error) {
            console.error("Error adding student:", error);
            res.send('Error adding student');
        } else {
            res.redirect('/');
        }
    });
});

// UPDATE: Render the edit form populated with current student data
app.get('/editStudent/:id', (req, res) => {
    const studentId = req.params.id;
    const sql = 'SELECT * FROM student WHERE studentId = ?';

    connection.query(sql, [studentId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.send('Error retrieving student by ID');
        }
        
        if (results.length > 0) {
            res.render('editStudent', { student: results[0] });
        } else {
            res.send('Student not found');
        }
    });
});

// UPDATE: Handle submission of the update form
app.post('/editStudent/:id', upload.single('image'), (req, res) => {
    const studentId = req.params.id;
    // FIXED: Extracted fields matching editStudent.ejs input fields (dob, contact)
    const { name, dob, contact } = req.body; 
    let image = req.body.currentImage; // Fallback to existing image name if not updated

    // Override with new uploaded file if one exists
    if (req.file) {
        image = req.file.originalname;
    }
    
    const sql = 'UPDATE student SET name = ?, dob = ?, contact = ?, image = ? WHERE studentId = ?';

    connection.query(sql, [name, dob, contact, image, studentId], (error, results) => {
        if (error) {
            console.error("Error updating student:", error);
            res.send('Error updating student');
        } else {
            res.redirect('/');
        }
    });
});

// DELETE: Remove a student record
app.get('/deleteStudent/:id', (req, res) => {
    const studentId = req.params.id;
    const sql = 'DELETE FROM student WHERE studentId = ?';

    connection.query(sql, [studentId], (error, results) => {
        if (error) {
            console.error("Error deleting student:", error);
            res.send('Error deleting student');
        } else {
            res.redirect('/');
        }
    });
});

// ==========================================
// 5. Server Initialization
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));