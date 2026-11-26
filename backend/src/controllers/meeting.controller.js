const { v4: uuidv4 } = require('uuid');
const Meeting = require('../models/Meeting');
const ApiResponse = require('../utils/ApiResponse');

exports.createMeeting = async (req, res) => {
  try {
    const { title, settings } = req.body;
    const roomCode = uuidv4().substring(0, 9);

    const meeting = await Meeting.create({
      roomCode,
      title: title || 'SignVerse Meeting',
      host: req.user._id,
      participants: [{ user: req.user._id }],
      settings: settings || {
        liveCaptionsEnabled: true,
        gestureRecognitionEnabled: true,
      },
    });

    const populatedMeeting = await meeting.populate('host', 'name email avatar');

    return ApiResponse.success(res, 'Meeting created', { meeting: populatedMeeting }, 201);
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

exports.getMeetingByCode = async (req, res) => {
  try {
    const { roomCode } = req.params;

    const meeting = await Meeting.findOne({ roomCode, status: 'active' })
      .populate('host', 'name email avatar')
      .populate('participants.user', 'name email avatar');

    if (!meeting) {
      return ApiResponse.error(res, 'Active meeting not found', 404);
    }

    return ApiResponse.success(res, 'Meeting retrieved', { meeting });
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

exports.endMeeting = async (req, res) => {
  try {
    const { roomCode } = req.params;

    const meeting = await Meeting.findOne({ roomCode });
    if (!meeting) {
      return ApiResponse.error(res, 'Meeting not found', 404);
    }

    if (meeting.host.toString() !== req.user._id.toString()) {
      return ApiResponse.error(res, 'Only the host can end the meeting', 403);
    }

    meeting.status = 'ended';
    await meeting.save();

    return ApiResponse.success(res, 'Meeting ended successfully', { meeting });
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};