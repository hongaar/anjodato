import { Collection, Doc, DocWithId } from "./schema";

const MAX_SCORE_PER_EXERCISE = 1000;

export const hasScore = (
  activeExercise: string,
  session?: Doc<Collection.Sessions>,
) => {
  return typeof session !== "undefined" &&
    typeof session?.scores !== "undefined"
    ? !!session?.scores[activeExercise]
    : false;
};

export const sortSessionsForExercise =
  (activeExercise: string) =>
  (a: Doc<Collection.Sessions>, b: Doc<Collection.Sessions>) => {
    if (
      typeof a.scores !== "undefined" &&
      typeof a.scores[activeExercise] !== "undefined" &&
      typeof b.scores !== "undefined" &&
      typeof b.scores[activeExercise] !== "undefined"
    ) {
      return a.scores[activeExercise] - b.scores[activeExercise];
    }

    if (
      typeof a.scores !== "undefined" &&
      typeof a.scores[activeExercise] !== "undefined"
    ) {
      return -1;
    }

    if (
      typeof b.scores !== "undefined" &&
      typeof b.scores[activeExercise] !== "undefined"
    ) {
      return 1;
    }

    return 0;
  };

export const calculateTotalScore = (
  exercises: DocWithId<Collection.Exercises>[],
  sessions: DocWithId<Collection.Sessions>[],
) => {
  // Build a map of total time taken for each exercise across all sessions
  const exerciseMaxTime: { [key: string]: number } = {};
  exercises.forEach((exercise) => {
    exerciseMaxTime[exercise.id] = 0;
    sessions.forEach((session) => {
      if (
        typeof session.scores !== "undefined" &&
        typeof session.scores[exercise.id] !== "undefined"
      ) {
        if (session.scores[exercise.id] > exerciseMaxTime[exercise.id]) {
          exerciseMaxTime[exercise.id] = session.scores[exercise.id];
        }
      }
    });
  });

  return (session: DocWithId<Collection.Sessions>) => {
    // Iterate each exercise in the scores, and calculate relative score based on total score for exercise
    if (typeof session.scores === "undefined") {
      return {
        id: session.id,
        color: session.color,
        total_score: 0,
      };
    }

    let totalScore = 0;

    Object.entries(session.scores).forEach(([exerciseId, score]) => {
      // Relative inverted score
      totalScore =
        totalScore +
        (1 - score / exerciseMaxTime[exerciseId]) * MAX_SCORE_PER_EXERCISE;
    });

    return {
      id: session.id,
      color: session.color,
      total_score: Math.round(totalScore),
    };
  };
};
