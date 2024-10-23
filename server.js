const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const userRoutes = require('./src/user/routes');
const cors = require('cors'); 

const app = express();
const port = 3000;
app.use(cors());



const supabaseUrl = 'https://twytcppiyyqowuyjvmft.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3eXRjcHBpeXlxb3d1eWp2bWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2Nzc3OTYsImV4cCI6MjA0NTI1Mzc5Nn0.Jbi627MhoZWuz-KK0m7KtcrhJmxSzuHibxX1M8SHzKE'
const supabase = createClient(supabaseUrl, supabaseKey)

app.use(express.json());

app.get("/", (req, res) => {
    res.send("testing api");
});

app.use("/api/v1/users", userRoutes);

app.listen(port, () => console.log(`app listining on ${port}`));
