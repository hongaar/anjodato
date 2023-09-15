import { Updates } from "./Updates";
import { User } from "./User";

export function Dashboard() {
  console.debug("Rendering component Dashboard");

  return (
    <div>
      <h1>Dashboard</h1>
      <User />
      <Updates />
    </div>
  );
}
