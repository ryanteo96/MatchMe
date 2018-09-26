var express = require('express');
var router = express.Router();
var auth = require("../controllers/AuthController.js");


router.get('/', auth.index);
router.get('/register', auth.register);
router.post('/register', auth.doRegister);
router.get('/login', auth.login);
router.post('/login', auth.doLogin);
router.get('/logout', auth.logout);

module.exports = router;

