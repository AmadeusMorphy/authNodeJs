const pool = require("../../db");
const queries = require("./queries");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "nizaR*123"; 

const getUsers = (req, res) => {
  pool.query(queries.getUsers, (error, results) => {
    if (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Database error" });
      return;
    }
    res.status(200).json(results.rows);
  });
};

const getUserById = (req, res) => {
  const id = req.params.id; //the id is a string so you have to parse it
  pool.query(queries.getUserById, [id], (error, results) => {
    const isUserExist = results.rows.length;
    if (isUserExist) {
      res.status(200).json(results.rows);
    } else {
      res.send("User doesnt exist!");
    }
    if (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Database error" });
      return;
    }
  });
};

// Register a new user
const addUser = async (req, res) => {
    const { name, email, age, dob, password } = req.body;

    // CHECK IF EMAIL EXISTS
    const emailExists = await pool.query(queries.checkEmailExists, [email]);
    if (emailExists.rows.length) {
        return res.status(409).send("Email already exists!"); // 409 Conflict
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ADD user TO THE DATABASE
    pool.query(
        queries.addUser,
        [name, email, age, dob, hashedPassword],
        (error, results) => {
            if (error) {
                console.error("Error:", error);
                return res.status(500).json({ error: "Database error" });
            }
            res.status(201).json({ message: "User created successfully!" });
        }
    );
};
// Login a user
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    console.log("Login attempt:", email);

    const user = await pool.query(queries.getUserByEmail, [email]);
    console.log("User found:", user.rows);

    if (user.rows.length === 0) {
        return res.status(401).send("Invalid credentials!"); // 401 Unauthorized
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    console.log("Password valid:", validPassword);

    if (!validPassword) {
        return res.status(401).send("Invalid credentials!"); // 401 Unauthorized
    }

    const token = jwt.sign({ id: user.rows[0].id, email: user.rows[0].email }, JWT_SECRET, {
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

const deleteUser = (req, res) => {
  const id = req.params.id;
  pool.query(queries.getUserById, [id], (error, results) => {
    const noUserFound = !results.rows.length;
    if (noUserFound) {
      res.send("user doesnt exist!");
    }
    pool.query(queries.deleteUser, [id], (error, results) => {
      if (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Database error" });
        return;
      }
      if (!noUserFound) {
        res.status(200).json("user was deleted successfully!");
      }
    });
  });
};

const updateUser = (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email } = req.body;

  pool.query(queries.getUserById, [id], (error, results) => {
    const noUserFound = !results.rows.length;
    if (noUserFound) {
      res.send("user doesnt exist!");
    }

    pool.query(queries.updateUser, [name, email, id], (error, results) => {
      if (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Database error" });
        return;
      }
      if (!noUserFound) {
        res.status(200).json("user was updated successfully!");
      }
    });
  });
};

module.exports = {
    authenticateToken,
    getUsers,
    addUser,
    loginUser,
    authenticateToken,
    getUserById,
    updateUser,
    deleteUser,
};
