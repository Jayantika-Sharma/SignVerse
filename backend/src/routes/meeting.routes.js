const express = require('express');
const router = express.Router();
const {
  createMeeting,
  getMeetingByCode,
  endMeeting,
} = require('../controllers/meeting.controller');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').post(createMeeting);
router.route('/:roomCode').get(getMeetingByCode);
router.route('/:roomCode/end').put(endMeeting);

module.exports = router;