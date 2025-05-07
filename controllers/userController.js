const userService = require('../services/userService');
const bcrypt = require('bcrypt');

exports.getLogin = (req, res) => res.render('login');
exports.getRegister = (req, res) => res.render('register');

exports.postRegister = async (req, res) => {
  const { username, password } = req.body;
  const existingUser = await userService.findByUsername(username);
  if (existingUser) return res.render('register', { error: 'User exists' });

  await userService.createUser(username, password);
  res.redirect('/login');
};

exports.postLogin = async (req, res) => {
  const { username, password } = req.body;
  const user = await userService.findByUsername(username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.render('login', { error: 'Invalid credentials' });
  }
  req.session.user = { id: user.id, username: user.username };
  res.redirect('/');
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
};
