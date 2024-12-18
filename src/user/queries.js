const getUsers = "SELECT * FROM users";
const addUser = "INSERT INTO users (name, email, age, dateCreated, password) VALUES ($1, $2, $3, $4, $5)";
const getUserById = "SELECT * FROM users WHERE id = $1";
const checkEmailExists = "SELECT s FROM users s WHERE s.email = $1";
const updateUser = "UPDATE users SET name = $1, email = $2 WHERE id = $3";
const deleteUser = "DELETE FROM users WHERE id = $1";
const getUserByEmail = "SELECT * FROM users WHERE email = $1";
const addFriendToUser = "UPDATE users SET friends = array_append(friends, $1) WHERE id = $2";
const sendFriendReq = "UPDATE users SET friendReqs = array_append(friendReqs, $1) WHERE id = $2";


module.exports = {
    getUsers,
    addUser,
    getUserById,
    checkEmailExists,
    updateUser,
    sendFriendReq,
    addFriendToUser,
    getUserByEmail,
    deleteUser,
};