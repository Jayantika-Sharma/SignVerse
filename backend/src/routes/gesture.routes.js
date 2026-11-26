const express = require('express');
const router = express.Router();
const { getGestures, seedGestures } = require('../controllers/gesture.controller');

router.get('/', getGestures);
router.post('/seed', seedGestures);

module.exports = router;