export type Gender = "male" | "female";
export type StudentStatus = "active" | "inactive" | "withdrawn";
export type EnrollmentType = "new" | "re_enrollment" | "transfer";

export interface Guardian {
	id?: string;
	name: string;
	relation: string;
	phone: string;
	profession: string;
	isEmergencyContact: boolean;
}

export interface StudentSchoolHistory {
	previousSchool: string;
	lastClass: string;
	isRepeating: boolean;
}

export interface StudentServices {
	hasTransport: boolean;
	hasCanteen: boolean;
}

export interface StudentDocuments {
	birthCertificate: boolean;
	photoId: boolean;
	residenceCertificate: boolean;
}

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
	enrollmentType: EnrollmentType;
	photoUrl: string | null;
	schoolHistory: StudentSchoolHistory | null;
	services: StudentServices;
	documents: StudentDocuments;
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
	enrollmentType: EnrollmentType;
	guardians: Guardian[];
	schoolHistory: StudentSchoolHistory | null;
	services: StudentServices;
	documents: StudentDocuments;
	photoUrl?: string | null;
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
