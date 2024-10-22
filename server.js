const express = require('express');
const studentRoutes = require('./src/student/routes');
const cors = require('cors'); 

const app = express();
const port = 3000;
app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
    res.send("testing api");
});

app.use("/api/v1/students", studentRoutes);

app.listen(port, () => console.log(`app listining on ${port}`));
