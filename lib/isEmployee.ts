import { getUserRole } from "./getRole";

export async function isEmployee() {
  const role = await getUserRole();

  return role === "employee";
}