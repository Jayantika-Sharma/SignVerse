const Gesture = require('../models/Gesture');
const ApiResponse = require('../utils/ApiResponse');

exports.getGestures = async (req, res) => {
  try {
    const { category, signLanguage } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category; 
    if (signLanguage) filter.signLanguage = signLanguage; 

    const gestures = await Gesture.find(filter).sort({ category: 1, label: 1 });

    return ApiResponse.success(res, 'Gestures retrieved', {
      count: gestures.length,
      gestures,
    });
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

exports.seedGestures = async (req, res) => {
  try {
    const initialVocabulary = [
      { label: 'A', category: 'letter', signLanguage: 'ASL', spokenEquivalent: 'A', modelClassIndex: 0 },
      { label: 'B', category: 'letter', signLanguage: 'ASL', spokenEquivalent: 'B', modelClassIndex: 1 },
      { label: 'C', category: 'letter', signLanguage: 'ASL', spokenEquivalent: 'C', modelClassIndex: 2 },
      { label: '1', category: 'number', signLanguage: 'ASL', spokenEquivalent: 'One', modelClassIndex: 3 },
      { label: '2', category: 'number', signLanguage: 'ASL', spokenEquivalent: 'Two', modelClassIndex: 4 },
      { label: 'Hello', category: 'word', signLanguage: 'ASL', spokenEquivalent: 'Hello', modelClassIndex: 5 },
      { label: 'Thank You', category: 'word', signLanguage: 'ASL', spokenEquivalent: 'Thank you', modelClassIndex: 6 },
      { label: 'Yes', category: 'word', signLanguage: 'ASL', spokenEquivalent: 'Yes', modelClassIndex: 7 },
      { label: 'No', category: 'word', signLanguage: 'ASL', spokenEquivalent: 'No', modelClassIndex: 8 },
      { label: 'Please repeat', category: 'phrase', signLanguage: 'ASL', spokenEquivalent: 'Please repeat that', modelClassIndex: 9 },
      { label: 'I understand', category: 'statement', signLanguage: 'ASL', spokenEquivalent: 'I understand what you mean', modelClassIndex: 10 },
    ];

    for (const item of initialVocabulary) {
      await Gesture.findOneAndUpdate({ label: item.label, signLanguage: item.signLanguage }, item, {
        upsert: true,
        new: true,
      });
    }

    return ApiResponse.success(res, 'Gesture dictionary seeded successfully', {
      seededCount: initialVocabulary.length,
    });
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};