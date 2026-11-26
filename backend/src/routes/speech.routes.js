const express = require('express');
const router = express.Router();
const { synthesizeSpeech, logCaption } = require('../controllers/speech.controller');

router.post('/synthesize', synthesizeSpeech);
router.post('/log', logCaption);

module.exports = router;