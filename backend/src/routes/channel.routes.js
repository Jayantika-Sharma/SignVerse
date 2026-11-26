const express = require('express');
const router = express.Router();
const {
  createChannel,
  getChannels,
  joinChannel,
} = require('../controllers/channel.controller');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').post(createChannel).get(getChannels);
router.route('/:id/join').post(joinChannel);

module.exports = router;