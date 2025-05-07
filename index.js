const express = require('express');
const session = require('express-session');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const lotRoutes = require('./routes/lotRoutes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: 'auction-secret',
  resave: false,
  saveUninitialized: false
}));

app.use('/', lotRoutes);
app.use('/', userRoutes);

app.listen(3000, () => console.log('Server started on http://localhost:3000'));
