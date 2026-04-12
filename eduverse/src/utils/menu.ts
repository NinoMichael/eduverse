export interface NavItem {
	label: string;
	icon: string;
	route: string;
}

export const navItems: NavItem[] = [
	{ label: "Accueil", icon: "home", route: "/dashboard" },
	{
		label: "Année scolaire",
		icon: "calendar-week",
		route: "/dashboard/school-year/list",
	},
	{ label: "Étudiants", icon: "user-graduate", route: "/dashboard/students" },
	{
		label: "Professeurs",
		icon: "chalkboard-teacher",
		route: "/dashboard/teachers",
	},
	{ label: "Classes", icon: "door-open", route: "/dashboard/classes" },
	{
		label: "Présences",
		icon: "clipboard-check",
		route: "/dashboard/attendance",
	},
	{ label: "Notes", icon: "chart-line", route: "/dashboard/grades" },
	{
		label: "Emplois du temps",
		icon: "calendar-alt",
		route: "/dashboard/schedule",
	},
	{ label: "Paramètres", icon: "cog", route: "/dashboard/settings" },
];
