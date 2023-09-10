import { calculateTotalScore, Collection, DocWithId } from "../api";

type Props = {
  exercises: DocWithId<Collection.Exercises>[];
  sessions: DocWithId<Collection.Sessions>[];
  activeSession?: DocWithId<Collection.Sessions>;
};

export function Podium({ sessions, exercises, activeSession }: Props) {
  console.debug("Rendering Podium");

  return (
    <div className="player-list">
      <ul>
        {sessions
          .filter((session) => session.online === true)
          .map(calculateTotalScore(exercises, sessions))
          .sort((a, b) => {
            if (a.total_score < b.total_score) return 1;
            if (a.total_score > b.total_score) return -1;
            return 0;
          })
          .map((session, index) => (
            <li
              key={session.id}
              className={
                activeSession && session.id === activeSession.id ? "active" : ""
              }
            >
              <span className="emoji">
                {index === 0
                  ? "🥇"
                  : index === 1
                  ? "🥈"
                  : index === 2
                  ? "🥉"
                  : ""}
              </span>
              {session.total_score || 0}
              <span
                className="badge"
                style={{ backgroundColor: session.color }}
              >
                {session.id}
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}
