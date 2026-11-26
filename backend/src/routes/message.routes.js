const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  uploadAttachment,
} = require('../controllers/message.controller');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.use(protect); 

router.route('/').post(sendMessage);
router.route('/:channelId').get(getMessages);
router.route('/upload').post(upload.single('file'), uploadAttachment);

module.exports = router;