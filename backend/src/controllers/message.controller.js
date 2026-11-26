const Message = require('../models/Message');
const Channel = require('../models/Channel');
const ApiResponse = require('../utils/ApiResponse');

exports.sendMessage = async (req, res) => {
  try {
    const { channelId, content, messageType, gestureMetadata, attachments } = req.body;

    if (!channelId || !content) {
      return ApiResponse.error(res, 'Channel ID and content are required', 400);
    }

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return ApiResponse.error(res, 'Channel not found', 404);
    }

    const message = await Message.create({
      channel: channelId,
      sender: req.user._id,
      content,
      messageType: messageType || 'standard',
      gestureMetadata: gestureMetadata || {},
      attachments: attachments || [],
    });

    const populatedMessage = await message.populate('sender', 'name email avatar outputPreference');

    return ApiResponse.success(res, 'Message sent successfully', { message: populatedMessage }, 201);
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const messages = await Message.find({ channel: channelId })
      .populate('sender', 'name email avatar outputPreference')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Return in chronological order (oldest to newest)
    return ApiResponse.success(res, 'Messages retrieved', { messages: messages.reverse() });
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

exports.uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return ApiResponse.error(res, 'Please upload a file', 400);
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    return ApiResponse.success(res, 'File uploaded successfully', {
      url: fileUrl,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      size: req.file.size,
    });
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};