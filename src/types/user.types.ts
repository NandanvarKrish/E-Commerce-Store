import type { Database } from "./database.types";

export type UserRole = Database["public"]["Enums"]["user_role"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string | null;
  avatarUrl?: string | null;
}
