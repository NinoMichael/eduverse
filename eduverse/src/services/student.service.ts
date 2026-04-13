import { invoke } from "@tauri-apps/api/core";
import type { ApiResponse } from "./auth.service";
import type { Student, StudentFormData, StudentFilters, StudentStats } from "@/types/student";

class StudentService {
	async getStudents(schoolId: string, schoolYearId: string): Promise<ApiResponse<Student[]>> {
		try {
			const response = await invoke<Student[]>("get_students", {
				schoolId,
				schoolYearId,
			});
			return { success: true, data: response };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async getStudentById(id: string): Promise<ApiResponse<Student>> {
		try {
			const response = await invoke<Student>("get_student_by_id", { id });
			return { success: true, data: response };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async createStudent(
		schoolId: string,
		schoolYearId: string,
		data: StudentFormData
	): Promise<ApiResponse<Student>> {
		try {
			const response = await invoke<Student>("create_student", {
				schoolId,
				schoolYearId,
				firstName: data.firstName,
				lastName: data.lastName,
				gender: data.gender,
				dateOfBirth: data.dateOfBirth,
				placeOfBirth: data.placeOfBirth,
				address: data.address,
				phone: data.phone,
				email: data.email,
				guardianName: data.guardianName,
				guardianPhone: data.guardianPhone,
				guardianRelation: data.guardianRelation,
				classId: data.classId,
			});
			return { success: true, data: response };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async updateStudent(id: string, data: Partial<StudentFormData>): Promise<ApiResponse<Student>> {
		try {
			const response = await invoke<Student>("update_student", {
				id,
				...data,
			});
			return { success: true, data: response };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async deleteStudent(id: string): Promise<ApiResponse<void>> {
		try {
			await invoke<void>("delete_student", { id });
			return { success: true };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async getStudentStats(schoolId: string, schoolYearId: string): Promise<ApiResponse<StudentStats>> {
		try {
			const response = await invoke<StudentStats>("get_student_stats", {
				schoolId,
				schoolYearId,
			});
			return { success: true, data: response };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	filterStudents(students: Student[], filters: StudentFilters): Student[] {
		return students.filter((student) => {
			const searchMatch =
				filters.search === "" ||
				student.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
				student.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
				student.matricule.toLowerCase().includes(filters.search.toLowerCase());
			
			const genderMatch =
				filters.gender === "" || student.gender === filters.gender;
			
			const classMatch =
				filters.classId === "" || student.classId === filters.classId;
			
			return searchMatch && genderMatch && classMatch;
		});
	}
}

export const studentService = new StudentService();
