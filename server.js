require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const userRoutes = require('./src/user/routes');
const cors = require('cors'); 

const app = express();
const port = 3000;
app.use(cors());



const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)


app.use(express.json());

app.use((req, res, next) => {
    const apiKey = req.headers["x-mrnzd-key"];
    if (apiKey && apiKey === process.env.API_KEY) {
        next(); // Valid API key, proceed
    } else {
        res.status(403).json({ error: "Unauthorized" });
    }
});


app.get("/", (req, res) => {
    res.send("testing api");
});

app.use("/api/v1/users", userRoutes);

app.listen(port, () => console.log(`app listining on ${port}`));
