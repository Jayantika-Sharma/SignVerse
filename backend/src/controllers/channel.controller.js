const Channel = require('../models/Channel');
const ApiResponse = require('../utils/ApiResponse');

exports.createChannel = async (req, res) => {
  try {
    const { name, description, type, memberIds } = req.body;

    if (!name) {
      return ApiResponse.error(res, 'Channel name is required', 400);
    }

    const members = memberIds ? [...new Set([...memberIds, req.user._id])] : [req.user._id];

    const channel = await Channel.create({
      name,
      description: description || '',
      type: type || 'public',
      members,
      createdBy: req.user._id,
    });

    const populatedChannel = await channel.populate('members', 'name email avatar isOnline');

    return ApiResponse.success(res, 'Channel created successfully', { channel: populatedChannel }, 201);
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

exports.getChannels = async (req, res) => {
  try {
    const channels = await Channel.find({
      $or: [{ type: 'public' }, { members: req.user._id }],
    })
      .populate('members', 'name email avatar isOnline')
      .populate('createdBy', 'name email')
      .sort({ updatedAt: -1 });

    return ApiResponse.success(res, 'Channels retrieved', { channels });
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

exports.joinChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return ApiResponse.error(res, 'Channel not found', 404);
    }

    if (channel.members.includes(req.user._id)) {
      return ApiResponse.error(res, 'You are already a member of this channel', 400);
    }

    channel.members.push(req.user._id);
    await channel.save();

    return ApiResponse.success(res, 'Joined channel successfully', { channel });
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};