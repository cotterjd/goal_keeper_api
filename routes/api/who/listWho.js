module.exports = function ListWho(req, res) {
  return res.json({
    success: true,
    payload: req.user
  });
};
