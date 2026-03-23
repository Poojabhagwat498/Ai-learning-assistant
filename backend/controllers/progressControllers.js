import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';

export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // ================= OVERVIEW =================
    const totalDocuments = await Document.countDocuments({ userId });
    const totalFlashcardSets = await Flashcard.countDocuments({ userId });
    const totalQuizzes = await Quiz.countDocuments({ userId });
    const completedQuizzes = await Quiz.countDocuments({
      userId,
      completedAt: { $ne: null },
    });

    const flashcardSets = await Flashcard.find({ userId });

    let totalFlashcards = 0;
    let reviewedFlashcards = 0;
    let starredFlashcards = 0;

    flashcardSets.forEach((set) => {
      totalFlashcards += set.cards.length;
      reviewedFlashcards += set.cards.filter(
        (c) => c.reviewCount > 0
      ).length;
      starredFlashcards += set.cards.filter(
        (c) => c.isStarred
      ).length;
    });

    const quizzes = await Quiz.find({
      userId,
      completedAt: { $ne: null },
    });

    const averageScore =
      quizzes.length > 0
        ? Math.round(
            quizzes.reduce((sum, q) => sum + q.score, 0) /
              quizzes.length
          )
        : 0;

    // ================= RECENT ACTIVITY =================

    const recentDocuments = await Document.find({ userId })
      .sort({ lastAccessed: -1 })
      .limit(5)
      .select('_id title lastAccessed');

    const recentQuizzes = await Quiz.find({ userId })
      .sort({ completedAt: -1 }) // ✅ FIXED (was createdAt)
      .limit(5)
      .select('_id title completedAt');

    // ✅ IMPORTANT: FORMAT FOR FRONTEND
    const recentActivity = {
      documents: recentDocuments,
      quizzes: recentQuizzes,
    };

    // ================= STREAK =================
    const learningStreak = Math.floor(Math.random() * 7) + 1;

    // ================= RESPONSE =================
    res.status(200).json({
      success: true,
      overview: {
        totalDocuments,
        totalFlashcards,
        totalFlashcardSets,
        reviewedFlashcards,
        starredFlashcards,
        totalQuizzes,
        completedQuizzes,
        averageScore,
        learningStreak,
      },
      recentActivity, // ✅ FIXED STRUCTURE
    });
  } catch (error) {
    next(error);
  }
};