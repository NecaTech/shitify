import { z } from "zod";

export const emailSchema = z.string().email("Email invalide");

export const passwordSchema = z
  .string()
  .min(12, "Le mot de passe doit contenir au moins 12 caractères");

export const displayNameSchema = z
  .string()
  .min(1, "Le nom ne peut pas être vide")
  .max(100, "Le nom est trop long");
