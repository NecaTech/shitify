import "server-only";
import { findUserByEmail, findUserById } from "./repository";
import type { User } from "./types";

export async function getUserById(id: string): Promise<User | null> {
  return findUserById(id);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return findUserByEmail(email);
}
