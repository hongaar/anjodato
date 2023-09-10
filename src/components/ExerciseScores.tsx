import { formatDuration, intervalToDuration } from "date-fns"
import { Collection, DocWithId, sortSessionsForExercise } from "../api"

type Props = {
  exerciseId: string
  activeSession: DocWithId<Collection.Sessions>
  sessions: DocWithId<Collection.Sessions>[]
}

export function ExerciseScores({ exerciseId, activeSession, sessions }: Props) {
  console.debug("Rendering ExerciseScores")

  return (
    <div className="player-list">
      <ul>
        {sessions
          .filter((session) => session.online === true)
          .sort(sortSessionsForExercise(exerciseId))
          .map((session) => (
            <li
              key={session.id}
              className={session.id === activeSession.id ? "active" : ""}
            >
              <span
                className="badge"
                style={{ backgroundColor: session.color }}
              >
                {session.id}
              </span>
              {typeof session.scores !== "undefined" &&
              typeof session.scores[exerciseId] !== "undefined"
                ? formatDuration(
                    intervalToDuration({
                      start: 0,
                      end: session.scores[exerciseId] * 1000,
                    })
                  )
                : "not finished yet"}
            </li>
          ))}
      </ul>
    </div>
  )
}
