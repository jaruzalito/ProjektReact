const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const InstagramProfile = require('./models/InstagramProfile');
const Comment = require('./models/Comment');
const Rating = require('./models/Rating');
require('dotenv').config(); // wczytuje zmienne środowiskowe z .env

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Połączono z MongoDB"))
  .catch((err) => console.error("Błąd połączenia z MongoDB", err));

app.use('/api/ratings', require('./routes/ratings'));

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
