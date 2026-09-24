import type { Database } from "./database.types";

type TableName = keyof Database["public"]["Tables"];
type ProfileTable = Database["public"]["Tables"]["profiles"];
type ProfileRow = ProfileTable["Row"];
type ProfileInsert = ProfileTable["Insert"];
type ProfileUpdate = ProfileTable["Update"];

const p: ProfileRow = {
  id: "1",
  email: "a@b.com",
  full_name: "test",
  avatar_url: null,
  role: "customer",
  phone: null,
  created_at: "",
  updated_at: "",
};
console.log(p);
