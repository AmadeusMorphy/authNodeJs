const { createClient } = require('@supabase/supabase-js');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "nizaR*123"; 

const supabaseUrl = 'https://twytcppiyyqowuyjvmft.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3eXRjcHBpeXlxb3d1eWp2bWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2Nzc3OTYsImV4cCI6MjA0NTI1Mzc5Nn0.Jbi627MhoZWuz-KK0m7KtcrhJmxSzuHibxX1M8SHzKE';
const supabase = createClient(supabaseUrl, supabaseKey);

// const getUsers = async (req, res) => {
//   const { data, error } = await supabase
//     .from('users')
//     .select('*');

//   if (error) {
//     console.error("Error:", error);
//     return res.status(500).json({ error: "Database error" });
//   }

//   res.status(200).json(data);
// };

const getUsersByKey = async (req, res) => {
  const { key } = req.query; // Get the key from the query parameters

  // Check if the key is valid
  if (key !== 'nizaR*123') {
      return res.status(403).json({ message: "Invalid key" }); // Forbidden
  }else{

  // If valid, fetch users
  const { data, error } = await supabase
    .from('users')
    .select('*');
    res.status(200).json(data);
  }
};


const getUserById = async (req, res) => {
  const id = req.params.id;
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id);

  if (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Database error" });
  }

  if (data.length === 0) {
    return res.status(404).send("User doesn't exist!");
  }

  res.status(200).json(data);
};

const addUser = async (req, res) => {
  const { name, email, age, dateCreated, password } = req.body;

  const { data: emailExists, error: emailError } = await supabase
    .from('users')
    .select('email')
    .eq('email', email);

  if (emailExists.length) {
    return res.status(409).send("Email already exists!");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('users')
    .insert([{ name, email, age, dateCreated, password: hashedPassword }]);

  if (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Database error" });
  }

  res.status(201).json({ message: "User created successfully!" });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email);

  if (error || user.length === 0) {
    return res.status(401).send("Invalid credentials!");
  }

  const validPassword = await bcrypt.compare(password, user[0].password);

  if (!validPassword) {
    return res.status(401).send("Invalid credentials!");
  }

  const token = jwt.sign({ id: user[0].id, email: user[0].email }, JWT_SECRET, {
    expiresIn: "1d",
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

const deleteUser = async (req, res) => {
  const id = req.params.id;

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id);

  if (user.length === 0) {
    return res.status(404).send("User doesn't exist!");
  }

  const { error: deleteError } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (deleteError) {
    console.error("Error:", deleteError);
    return res.status(500).json({ error: "Database error" });
  }

  res.status(200).json("User deleted successfully!");
};

const updateUser = async (req, res) => {
  const id = req.params.id;
  const { name, email } = req.body;

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id);

  if (user.length === 0) {
    return res.status(404).send("User doesn't exist!");
  }

  const { error: updateError } = await supabase
    .from('users')
    .update({ name, email })
    .eq('id', id);

  if (updateError) {
    console.error("Error:", updateError);
    return res.status(500).json({ error: "Database error" });
  }

  res.status(200).json("User updated successfully!");
};

module.exports = {
  authenticateToken,
  // getUsers,
  getUsersByKey,
  addUser,
  loginUser,
  getUserById,
  updateUser,
  deleteUser,
};
