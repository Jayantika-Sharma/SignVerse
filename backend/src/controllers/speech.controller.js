const ApiResponse = require('../utils/ApiResponse');

exports.synthesizeSpeech = async (req, res) => {
  try {
    const { text, language = 'en-US', speed = 1.0 } = req.body;

    if (!text) {
      return ApiResponse.error(res, 'Text is required for speech synthesis', 400);
    }

    return ApiResponse.success(res, 'Speech synthesis ready', {
      text,
      language,
      speed,
      voiceEngine: 'WebSpeech / ServerSynthesis',
    });
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

exports.logCaption = async (req, res) => {
  try {
    const { meetingRoomCode, speakerName, transcript, isFinal = true } = req.body;

    if (!meetingRoomCode || !transcript) {
      return ApiResponse.error(res, 'Meeting room code and transcript are required', 400);
    }

    return ApiResponse.success(res, 'Caption logged', {
      meetingRoomCode,
      speakerName: speakerName || 'Participant',
      transcript,
      isFinal,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};