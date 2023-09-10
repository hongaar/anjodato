import { differenceInSeconds, formatDistance } from "date-fns"
import { Collection, DocWithId } from "../api"
import { useDocWriter, useTime } from "../hooks"

type Props = {
  exercise: DocWithId<Collection.Exercises>
  activeSession: DocWithId<Collection.Sessions>
}

export function ExerciseTimer({ exercise, activeSession }: Props) {
  console.debug("Rendering ExerciseTimer")

  const currentTime = useTime()
  const writeSession = useDocWriter(Collection.Sessions)

  const exerciseStartedAt = exercise?.started_at?.toDate() || Date.now()

  function finish() {
    const seconds = differenceInSeconds(currentTime, exerciseStartedAt)
    writeSession(activeSession.id || "UNKNOWN", {
      scores: {
        [exercise.id]: seconds,
      },
    })
  }

  return (
    <div>
      <p>Once you're finished, hit the big green button below</p>
      <button className="finish" onClick={finish}>
        {formatDistance(currentTime, exerciseStartedAt, {
          includeSeconds: true,
        })}
      </button>
    </div>
  )
}
