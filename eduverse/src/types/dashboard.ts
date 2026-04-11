export interface DashboardStats {
	totalStudents: number;
	presentStudents: number;
	absentStudents: number;
	lateStudents: number;
}

export interface Student {
	id: string;
	firstName: string;
	lastName: string;
	className: string;
	level: string;
	attendanceStatus: "present" | "absent" | "late";
	createdAt: string;
}

export interface ClassLevel {
	name: string;
	studentCount: number;
	color: string;
}

export interface DashboardData {
	stats: DashboardStats;
	recentStudents: Student[];
	levelDistribution: ClassLevel[];
}
