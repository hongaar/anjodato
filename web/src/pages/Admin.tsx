import { orderBy, Timestamp, where } from "firebase/firestore";
import { useState } from "react";
import { Collection, sluggify } from "../api";
import { Podium } from "../components";
import {
  useCollection,
  useDocDeleter,
  useDocument,
  useDocWriter,
  useQuery,
  useSession,
} from "../hooks";

export function Admin({ params }: { params: { workshop: string } }) {
  console.debug("Rendering Admin");

  const exercises = useQuery(
    Collection.Exercises,
    where("workshop", "==", params.workshop),
    orderBy("order"),
  );
  const workshop = useDocument(Collection.Workshops, params.workshop);
  const writeWorkshop = useDocWriter(Collection.Workshops);
  const activeExerciseId = workshop?.activeExcercise;
  const writeExercise = useDocWriter(Collection.Exercises);
  const deleteExercise = useDocDeleter(Collection.Exercises);
  const sessions = useCollection(Collection.Sessions);
  const { name } = useSession();
  const [newExerciseName, setNewExerciseName] = useState("");
  const activeSession = sessions.find((session) => session.id === name);
  const maxOrder = exercises.reduce((prev, current) => {
    return current.order > prev ? current.order : prev;
  }, 0);

  function makeActive(exerciseId: string | null) {
    writeWorkshop(params.workshop, { activeExcercise: exerciseId });
  }

  function startTimer(exerciseId: string | null) {
    writeExercise(exerciseId || "UNKNOWN", {
      started_at: Timestamp.fromDate(new Date()),
    });
  }

  function makeActiveAndStartTimer(exerciseId: string | null) {
    makeActive(exerciseId);
    startTimer(exerciseId);
  }

  function addExercise() {
    writeExercise(sluggify(newExerciseName), {
      workshop: params.workshop,
      name: newExerciseName,
      order: maxOrder + 1,
    });
    setNewExerciseName("");
  }

  if (!workshop) {
    return <p>Workshop not found</p>;
  }

  return (
    <div className="admin">
      <h1>Admin for {params.workshop}</h1>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th></th>
            <th>Exercise</th>
            <th></th>
            <th>Finished</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {exercises?.map((exercise) => (
            <tr
              key={exercise.id}
              className={
                exercise.id === activeExerciseId
                  ? "active"
                  : exercise.started_at
                  ? "started"
                  : ""
              }
            >
              <td>{exercise.order}</td>
              <td>{exercise.id === activeExerciseId ? "👉" : ""}</td>
              <td>
                {exercise.started_at ? "✅ " : " "}
                {exercise.name}
              </td>
              <td>
                {exercise.started_at ? (
                  <button onClick={(e) => makeActive(exercise.id)}>
                    Make active again
                  </button>
                ) : (
                  <button onClick={(e) => makeActiveAndStartTimer(exercise.id)}>
                    Make active &amp; reset time
                  </button>
                )}
              </td>
              <td>
                {sessions
                  .reduce(
                    ([finished, total], session) => {
                      if (session.online) {
                        total = total + 1;
                      }
                      if (session.scores && session.scores[exercise.id] > 0) {
                        finished = finished + 1;
                      }
                      return [finished, total];
                    },
                    [0, 0],
                  )
                  .join("/")}{" "}
              </td>
              <td>
                <button onClick={(e) => deleteExercise(exercise.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          <tr>
            <td></td>
            <td></td>
            <td>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addExercise();
                }}
              >
                <input
                  type="text"
                  placeholder="New exercise"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                />
                <button type="submit">Add</button>
              </form>
            </td>
          </tr>
        </tbody>
      </table>
      <h2>Podium</h2>
      <div>
        {activeExerciseId === null ? "👉 " : " "}
        <button
          onClick={(e) => makeActive(null)}
          className={activeExerciseId === null ? "active" : ""}
        >
          Show podium
        </button>
      </div>
      <Podium
        exercises={exercises}
        sessions={sessions}
        activeSession={activeSession}
      />
    </div>
  );
}
