import type { DashboardConfig } from "./types";

export const dashboardConfig: DashboardConfig = {
  eyebrow: "Pilot dashboard",
  title: "Vue d'ensemble",
  description:
    "Base modifiable pour présenter rapidement l'activité d'un projet pilote.",
  stats: [
    {
      label: "Utilisateurs",
      value: "12",
      helper: "Comptes de démonstration ou ambassadeurs",
    },
    {
      label: "Demandes",
      value: "8",
      helper: "Contacts, réservations ou commandes à traiter",
    },
    {
      label: "Revenus simulés",
      value: "2 480 EUR",
      helper: "Exemple commerce à remplacer par les métriques métier",
    },
  ],
  actions: [
    { label: "Gérer le CRUD", href: "/dashboard/crud", tone: "primary" },
    { label: "Configurer la démo", href: "/dashboard/crud", tone: "secondary" },
  ],
  sections: [
    {
      title: "Pipeline",
      description: "Remplacer ces lignes par les étapes réelles du pilote.",
      items: [
        { label: "Nouveaux contacts", value: "4" },
        { label: "En attente", value: "3" },
        { label: "Terminés", value: "1" },
      ],
    },
    {
      title: "Prochaine itération",
      description: "Garder visible ce qui doit être adapté pour le client.",
      items: [
        { label: "Données seed", value: "À personnaliser" },
        { label: "Feature métier", value: "À brancher" },
        { label: "Readiness", value: "Warnings à réduire" },
      ],
    },
  ],
};
