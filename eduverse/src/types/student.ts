export type Gender = "male" | "female";
export type StudentStatus = "active" | "inactive" | "withdrawn";

export interface Student {
	id: string;
	schoolId: string;
	schoolYearId: string;
	firstName: string;
	lastName: string;
	matricule: string;
	gender: Gender;
	dateOfBirth: string;
	placeOfBirth: string;
	address: string;
	phone: string;
	email: string;
	guardianName: string;
	guardianPhone: string;
	guardianRelation: string;
	classId: string | null;
	className: string | null;
	status: StudentStatus;
	enrollmentDate: string;
	photoUrl: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface StudentFormData {
	firstName: string;
	lastName: string;
	gender: Gender;
	dateOfBirth: string;
	placeOfBirth: string;
	address: string;
	phone: string;
	email: string;
	guardianName: string;
	guardianPhone: string;
	guardianRelation: string;
	classId: string | null;
}

export interface StudentFilters {
	search: string;
	gender: Gender | "";
	classId: string;
}

export interface StudentStats {
	total: number;
	reEnrollments: number;
	newEnrollments: number;
	withdrawn: number;
}
