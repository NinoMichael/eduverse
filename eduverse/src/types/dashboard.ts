export interface DashboardStats {
	currentYear: string | null;
	totalStudents: number;
	totalClasses: number;
	totalTeachers: number;
}

export interface SchoolYear {
	id: string;
	name: string;
	startDate: string;
	endDate: string;
	isActive: boolean;
}

export interface ScheduleItem {
	id: string;
	className: string;
	teacherName: string;
	subject: string;
	startTime: string;
	endTime: string;
	dayOfWeek: number;
}

export interface DashboardData {
	stats: DashboardStats;
	schoolYear: SchoolYear | null;
	schedules: ScheduleItem[];
}
