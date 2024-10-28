const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const JWT_SECRET =
  "p5XqM279OM6vPZP4VoFugaEO8gEMrGbsAU7Jg+acIU05yVFU/3L52dsqBvnuRXXZT4ZxR7rs0O98j74WMykrjQ==";

const supabaseUrl = "https://twytcppiyyqowuyjvmft.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3eXRjcHBpeXlxb3d1eWp2bWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2Nzc3OTYsImV4cCI6MjA0NTI1Mzc5Nn0.Jbi627MhoZWuz-KK0m7KtcrhJmxSzuHibxX1M8SHzKE";
const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: "public" },
});

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
  if (key !== "nizaR*123") {
    return res.status(403).json({ message: "Invalid key" }); // Forbidden
  } else {
    // If valid, fetch users
    const { data, error } = await supabase.from("users").select("*");
    res.status(200).json(data);
  }
};

const getUserById = async (req, res) => {
  const id = req.params.id;
  const { data, error } = await supabase.from("users").select("*").eq("id", id);

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
    .from("users")
    .select("email")
    .eq("email", email);

  if (emailExists.length) {
    return res.status(409).send("Email already exists!");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
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
    .from("users")
    .select("*")
    .eq("email", email);

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
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

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
    .from("users")
    .select("*")
    .eq("id", id);

  if (user.length === 0) {
    return res.status(404).send("User doesn't exist!");
  }

  const { error: deleteError } = await supabase
    .from("users")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("Error:", deleteError);
    return res.status(500).json({ error: "Database error" });
  }

  res.status(200).json("User deleted successfully!");
};

const updateUser = async (req, res) => {
  const id = req.params.id;
  const { name, email, friends } = req.body;

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id);

  if (user.length === 0) {
    return res.status(404).send("User doesn't exist!");
  }

  const { error: updateError } = await supabase
    .from("users")
    .update({ name, email, friends })
    .eq("id", id);

  if (updateError) {
    console.error("Error:", updateError);
    return res.status(500).json({ error: "Database error" });
  }

  res.status(200).json("User updated successfully!");
};

const addFriendToUser = async (req, res) => {
  const userId = req.params.id;
  const { friendId } = req.body;

  // Generate a unique friendship ID (first 6 characters of a UUID)
  const friendshipId = uuidv4().substring(0, 6);
  const messagesTableName = `messages_${friendshipId}_${userId}`;

  try {
    // Create the messages table using the SQL function
    const { error: createTableError } = await supabase.rpc(
      "create_messages_table",
      {
        table_name: messagesTableName,
      }
    );

    if (createTableError) {
      console.error("Error creating messages table:", createTableError);
      return res.status(500).json({ error: "Error creating messages table" });
    }

    // Retrieve the user's current friendships
    const { data: userData, error: userFetchError } = await supabase
      .from("users")
      .select("friendships")
      .eq("id", userId)
      .single();

    if (userFetchError) {
      console.error("Error fetching user data:", userFetchError);
      return res.status(500).json({ error: "Error fetching user data" });
    }

    // Get current friendships or initialize as an empty object
    const friendships = userData.friendships || {};

    // Update user's friendships
    const { data: updatedUserData, error: userUpdateError } = await supabase
      .from("users")
      .update({
        friendships: [
          {
            ...friendships, // Retain existing friendships
          },
          {
            friendId: friendId,
            messagesId: messagesTableName, // Add new friendship
          },
        ],
      })
      .eq("id", userId)
      .select(
        "name, email, password, age, dateCreated, id, profileImg, friendships"
      );

    if (userUpdateError) {
      console.error("Error updating user friends:", userUpdateError);
      return res.status(500).json({ error: "Error updating user friends" });
    }

    // Update friend's friendships
    const { data: updatedFriendData, error: friendUpdateError } = await supabase
      .from("users")
      .update({
        friendships: [
          {
            ...friendships,
          },
          {
            // Retain existing friendships for the friend
            friendId: userId,
            messagesId: messagesTableName, // Add new friendship
          },
        ],
      })
      .eq("id", friendId)
      .select(
        "name, email, password, age, dateCreated, id, profileImg, friendships"
      );

    if (friendUpdateError) {
      console.error("Error updating friend:", friendUpdateError);
      return res.status(500).json({ error: "Error updating friend" });
    }

    // Format the response
    const formattedUserData = updatedUserData.map((user) => ({
      ...user,
      friendships: { id: friendId },
    }));

    const formattedFriendData = updatedFriendData.map((friend) => ({
      ...friend,
      friendships: { id: userId },
    }));

    res.status(200).json({
      message: "Friend added successfully!",
      friendshipId: friendshipId,
      messagesTableName: messagesTableName,
      userData: formattedUserData,
      friendData: formattedFriendData,
    });
  } catch (error) {
    console.error("Error in addFriendToUser:", error);
    res.status(500).json({ error: "Database error" });
  }
};

module.exports = {
  authenticateToken,
  // getUsers,
  getUsersByKey,
  addUser,
  loginUser,
  getUserById,
  addFriendToUser,
  updateUser,
  deleteUser,
};
