export type DashboardStat = {
  label: string;
  value: string;
  helper: string;
};

export type DashboardAction = {
  label: string;
  href: string;
  tone: "primary" | "secondary";
};

export type DashboardSection = {
  title: string;
  description: string;
  items: Array<{
    label: string;
    value: string;
  }>;
};

export type DashboardConfig = {
  eyebrow: string;
  title: string;
  description: string;
  stats: DashboardStat[];
  actions: DashboardAction[];
  sections: DashboardSection[];
};
