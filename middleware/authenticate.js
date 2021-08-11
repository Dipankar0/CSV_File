module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No token, Authorization denied' });
  }

  try {
    if (token == 'allow') next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
