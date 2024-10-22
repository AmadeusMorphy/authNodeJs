const pool = require("../../db");
const queries = require("./queries");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "nizaR*123"; 

const getStudents = (req, res) => {
  pool.query(queries.getStudents, (error, results) => {
    if (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Database error" });
      return;
    }
    res.status(200).json(results.rows);
  });
};

const getStudentById = (req, res) => {
  const id = parseInt(req.params.id); //the id is a string so you have to parse it
  pool.query(queries.getStudentById, [id], (error, results) => {
    const isStudentExist = results.rows.length;
    if (isStudentExist) {
      res.status(200).json(results.rows);
    } else {
      res.send("Student doesnt exist!");
    }
    if (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Database error" });
      return;
    }
  });
};

// Register a new student
const addStudent = async (req, res) => {
    const { name, email, age, dob, password } = req.body;

    // CHECK IF EMAIL EXISTS
    const emailExists = await pool.query(queries.checkEmailExists, [email]);
    if (emailExists.rows.length) {
        return res.status(409).send("Email already exists!"); // 409 Conflict
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ADD STUDENT TO THE DATABASE
    pool.query(
        queries.addStudent,
        [name, email, age, dob, hashedPassword],
        (error, results) => {
            if (error) {
                console.error("Error:", error);
                return res.status(500).json({ error: "Database error" });
            }
            res.status(201).json({ message: "Student created successfully!" });
        }
    );
};
// Login a student
const loginStudent = async (req, res) => {
    const { email, password } = req.body;

    console.log("Login attempt:", email);

    const student = await pool.query(queries.getStudentByEmail, [email]);
    console.log("Student found:", student.rows);

    if (student.rows.length === 0) {
        return res.status(401).send("Invalid credentials!"); // 401 Unauthorized
    }

    const validPassword = await bcrypt.compare(password, student.rows[0].password);
    console.log("Password valid:", validPassword);

    if (!validPassword) {
        return res.status(401).send("Invalid credentials!"); // 401 Unauthorized
    }

    const token = jwt.sign({ id: student.rows[0].id, email: student.rows[0].email }, JWT_SECRET, {
        expiresIn: "1h",
    });

    res.json({ token });
};

// Middleware to verify token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user; // Save user info to request
        next();
    });
};

const deleteStudent = (req, res) => {
  const id = parseInt(req.params.id);
  pool.query(queries.getStudentById, [id], (error, results) => {
    const noStudentFound = !results.rows.length;
    if (noStudentFound) {
      res.send("Student doesnt exist!");
    }
    pool.query(queries.deleteStudent, [id], (error, results) => {
      if (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Database error" });
        return;
      }
      if (!noStudentFound) {
        res.status(200).json("Student was deleted successfully!");
      }
    });
  });
};

const updateStudent = (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email } = req.body;

  pool.query(queries.getStudentById, [id], (error, results) => {
    const noStudentFound = !results.rows.length;
    if (noStudentFound) {
      res.send("Student doesnt exist!");
    }

    pool.query(queries.updateStudent, [name, email, id], (error, results) => {
      if (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Database error" });
        return;
      }
      if (!noStudentFound) {
        res.status(200).json("Student was updated successfully!");
      }
    });
  });
};

module.exports = {
    authenticateToken,
    getStudents,
    addStudent,
    loginStudent,
    authenticateToken,
    getStudentById,
    updateStudent,
    deleteStudent,
};
