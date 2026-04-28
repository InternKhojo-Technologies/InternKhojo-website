import { getUserRole } from "./getRole";

export async function isAdmin() {
  const role = await getUserRole();

  return role === "admin";
}