import { where } from "firebase/firestore";
import { Collection, hasScore } from "../api";
import { ExerciseScores, ExerciseTimer, Podium } from "../components";
import { useCollection, useDocument, useQuery, useSession } from "../hooks";

export function Exercises({ params }: { params: { workshop: string } }) {
  console.debug("Rendering Exercises");

  const workshop = useDocument(Collection.Workshops, params.workshop);
  const activeExerciseId = workshop?.activeExcercise || "UNKNOWN";
  const exercises = useQuery(
    Collection.Exercises,
    where("workshop", "==", params.workshop),
  );
  const activeExercise = exercises.find(
    (exercise) => exercise.id === activeExerciseId,
  );
  const sessions = useCollection(Collection.Sessions);
  const { name } = useSession();
  const activeSession = sessions.find((session) => session.id === name);

  const hasFinished = hasScore(activeExerciseId, activeSession);

  return (
    <div className="exercises">
      {workshop?.activeExcercise ? (
        <div>
          <h1>
            <span className="prefix">Exercise:</span> {activeExercise?.name}
          </h1>
          {activeSession ? (
            hasFinished ? (
              <>
                <h2>💪 You made it!</h2>
                <hr />
                <ExerciseScores
                  activeSession={activeSession}
                  exerciseId={activeExerciseId}
                  sessions={sessions}
                />
              </>
            ) : (
              <ExerciseTimer
                exercise={activeExercise!}
                activeSession={activeSession}
              />
            )
          ) : (
            <div>Please join first</div>
          )}
        </div>
      ) : (
        <>
          <h1>Podium</h1>
          <Podium
            exercises={exercises}
            sessions={sessions}
            activeSession={activeSession}
          />
        </>
      )}
    </div>
  );
}
