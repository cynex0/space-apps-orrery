const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

app.use(cors());

app.get('/api/small-bodies', async (req, res) => {
    const response = await fetch('https://ssd-api.jpl.nasa.gov/sbdb_query.api?fields=full_name,e,a,q,om,w,i,tp&limit=100');
    const data = await response.json();
    res.json(data);
});

app.listen(3000, () => {
    console.log('Proxy server running on port 3000');
});
