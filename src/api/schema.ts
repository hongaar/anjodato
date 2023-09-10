import { Timestamp } from "firebase/firestore"

export enum Collection {
  Workshops = "workshops",
  Exercises = "exercises",
  Sessions = "sessions",
}

type DocEnum = {
  [Collection.Workshops]: {
    name: string
    currentExerciseId: string | null
    activeExcercise: string | null
  }
  [Collection.Exercises]: {
    name: string
    order: number
    workshop: string
    started_at: Timestamp
  }
  [Collection.Sessions]: {
    online: boolean
    color: string
    scores: {
      [exerciseId: string]: number
    }
  }
}

export type Doc<T extends Collection> = DocEnum[T]

export type DocWithId<T extends Collection> = AddId<DocEnum[T]>

export type AddId<T> = { id: string } & T
