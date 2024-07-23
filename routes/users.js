var express = require('express');
var router = express.Router();
var User = require(`../models/User`);

/* GET users listing. */
router.get('/:id', function(req, res, next) {
  res.json({
    params : req.params
  });
});

module.exports = router;
