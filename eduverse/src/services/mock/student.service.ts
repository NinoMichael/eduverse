import type { ApiResponse } from "../auth.service";
import type { Student, StudentFormData, StudentFilters, StudentStats, Gender, EnrollmentType } from "@/types/student";
import { db } from "./storage";

const STUDENTS_COLLECTION = "students";

const generateId = (): string => {
	return "id_" + Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const generateMatricule = (enrollmentType: EnrollmentType = "new"): string => {
	const year = new Date().getFullYear();
	const random = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
	const prefix = enrollmentType === "transfer" ? "TRF" : enrollmentType === "re_enrollment" ? "REN" : "COL";
	return `${prefix}-${year}${random}`;
};

const getStudents = (): Student[] => {
	return db.get<Student[]>(STUDENTS_COLLECTION, []) ?? [];
};

const saveStudent = (student: Student): void => {
	const students = getStudents();
	const index = students.findIndex((s) => s.id === student.id);
	if (index >= 0) {
		students[index] = student;
	} else {
		students.push(student);
	}
	db.set(STUDENTS_COLLECTION, students);
};

const firstNames = ["Rasoa", "Manda", "Jean", "Roche", "Pierrot", "Claire", "Paul", "Anne", "Michel", "Sofia", "Thomas", "Julie", "David", "Emma", "Lucas", "Léa", "Nathan", "Chloé", "Alex", "Camille", "Fetra", "Aina", "Kouka", "Adjoua", "Zo", "Mbola", "Bakary", "Mariamu", "Oumar", "Khady", "Moussa", "Aminata", "Cheick", "Nadia", "Brice", "Laure", "Armand", "Céline", "Wilfried", "Patricia", "Gabriel", "Miora", "Tahina", "Ando", "Lova", "Sitraka", "Nirina", "Hery", "Mamy", "Tiana", "Lilian", "Voahangy", "Randy", "Fitia", "Jordan", "Samantha", "Eric", "Christelle", "Julien", "Faniry", "Narindra", "Mika", "Hanitra", "Ricky", "Patricia", "Arnaud", "Sabrina", "Lionel", "Onjani", "Florent", "Eliane", "Didier", "Micheline", "Philippe", "Vololona", "Jimmy", "Julienne", "Mathieu", "Vahinala", "Bruno", "Fanantenana", "Jean-Marc", "Rasoamanantena", "Claudine", "Olivier", "Norotiana", "Raymond", "Aurelie", "Richard", "Fanja", "Patrick", "Tojo", "Christian", "Mahaleo", "Jocelyn", "Veloniaina", "François", "Mavo", "René", "Mihaja", "Stéphane", "Anjanath", "Raphaël", "Mampionona", "Éric", "Soa", "Michel", "Fiderana", "Yannick", "Volana"];
const lastNames = ["Rakoto", "Rasoa", "Randria", "Ramaroson", "Ratsimba", "Razafindrakoto", "Razafindrazaka", "Randriamampionona", "Rakotovao", "Ramaroson", "Ratsitorah", "Razakamanantsoa", "Ramanantsoa", "Razafimanantsoa", "Andriatsilavo", "Ramananjato", "Razafison", "Rakotondratsipa", "Ratsarazaka", "Ramanantsoa", "Randriamatosoa", "Rakotoniaina", "Razafinandrasana", "Ratsahasina", "Ramaromanana", "Razanabahoaka", "Ratsilavonirina", "Andriamats", "Razafintsi", "Rakotondrafara", "Randriamanantena", "Andriantsoa", "Razafindratsima", "Ratsimbazafy", "Randriamanantsoa", "Razafitsitana", "Ramanatsi", "Ratsiamanana", "Rakotondrabe", "Rasoamampianina", "Ratsiferana", "Razafimbazaha", "Ramanantany", "Ratsirazon", "Randriatsory", "Razakantoanina", "Ramanatsiaka", "Ratsimbazafy", "Razafindralambo", "Andriamats", "Razafimanantsoa", "Ratsimbazafy", "Razafindrazaka", "Randriamaro", "Ramanantsoa", "Razakarat", "Randriamanantena", "Ratsimbazafy", "Razafindrakoto", "Ramanats", "Ratsimbazafy", "Razafitsi", "Randriamampionona", "Rakotozafy", "Razafindrazaka", "Ramanatsi", "Ratsimbazafy", "Randriamanatsoa", "Rakotondratsy", "Razafindratsy"];
const places = ["Antananarivo", "Toamasina", "Antsirabe", "Mahajanga", "Fianarantsoa", "Toliara", "Antsiranana", "Sambava", "Manakara", "Ihosy", "Morondava", "Betioky", "Ambositra", "Ambatondrazaka", "Maintirano", "Soavinandriana", "Moramanga", "Andramasina", "Arivonimamo", "Mandidrano"];
const relations = ["Raiamandreny (parents)", "Reny (mère)", "Razana (père)", "Tontolo (tuteur)", "Raha (grand-parent)", "Antsamy (oncle/tante)"];

const classes = [
	{ id: "class_1", name: "6ème Primaire" },
	{ id: "class_2", name: "5ème Primaire" },
	{ id: "class_3", name: "CM1" },
	{ id: "class_4", name: "CM2" },
	{ id: "class_5", name: "6ème Secondaire" },
	{ id: "class_6", name: "5ème Secondaire" },
	{ id: "class_7", name: "4ème Secondaire" },
	{ id: "class_8", name: "3ème Secondaire" },
	{ id: "class_9", name: "Seconde" },
	{ id: "class_10", name: "Première L" },
	{ id: "class_11", name: "Première S" },
	{ id: "class_12", name: "Terminale L" },
	{ id: "class_13", name: "Terminale S" },
	{ id: "class_14", name: "Terminale ES" },
];

const currentYear = new Date().getFullYear();
const enrollmentYear = currentYear - 1;

const mockStudents: Omit<Student, "id" | "createdAt" | "updatedAt">[] = Array.from({ length: 125 }, (_, i) => {
	const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
	const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
	const gender: Gender = Math.random() > 0.48 ? "male" : "female";
	const birthYear = 2008 + Math.floor(Math.random() * 6);
	const birthMonth = Math.floor(Math.random() * 12) + 1;
	const birthDay = Math.floor(Math.random() * 28) + 1;
	const enrollMonth = Math.floor(Math.random() * 6) + 1;
	const isReEnroll = Math.random() > 0.25;
	const isWithdrawn = Math.random() > 0.96;
	const cls = classes[Math.floor(Math.random() * classes.length)];
	
	return {
		schoolId: "school_1",
		schoolYearId: "year_1",
		firstName,
		lastName,
		matricule: `COL-${enrollmentYear}${(i + 1).toString().padStart(4, "0")}`,
		gender,
		dateOfBirth: `${birthYear}-${birthMonth.toString().padStart(2, "0")}-${birthDay.toString().padStart(2, "0")}`,
		placeOfBirth: places[Math.floor(Math.random() * places.length)],
		address: `${Math.floor(Math.random() * 500) + 1} Rue ${Math.floor(Math.random() * 100) + 1}, ${places[Math.floor(Math.random() * places.length)]}`,
		phone: "",
		email: "",
		guardianName: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastName}`,
		guardianPhone: `+225 ${Math.floor(Math.random() * 90000000 + 10000000)}`,
		guardianRelation: relations[Math.floor(Math.random() * relations.length)],
		classId: cls.id,
		className: cls.name,
		status: isWithdrawn ? "withdrawn" : "active",
		enrollmentDate: isReEnroll 
			? `${enrollmentYear - 1}-09-${Math.floor(Math.random() * 28) + 1}`
			: `${enrollmentYear}-${enrollMonth.toString().padStart(2, "0")}-${Math.floor(Math.random() * 28) + 1}`,
		enrollmentType: isReEnroll ? "re_enrollment" : "new",
		photoUrl: gender === "male" 
			? `https://randomuser.me/api/portraits/men/${(i % 70) + 1}.jpg`
			: `https://randomuser.me/api/portraits/women/${(i % 70) + 1}.jpg`,
		schoolHistory: null,
		services: { hasTransport: false, hasCanteen: false },
		documents: { birthCertificate: true, photoId: true, residenceCertificate: false },
	};
});

export class MockStudentService {
	async getStudents(schoolId: string, schoolYearId: string): Promise<ApiResponse<Student[]>> {
		try {
			let students = getStudents();
			
			if (students.length === 0) {
				console.log('[MockStudentService] Initializing mock students with schoolId:', schoolId, 'schoolYearId:', schoolYearId);
				students = mockStudents.map((s) => ({
					...s,
					schoolId: schoolId,
					schoolYearId: schoolYearId,
					id: generateId(),
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				}));
				db.set(STUDENTS_COLLECTION, students);
				console.log('[MockStudentService] Created', students.length, 'students');
			}
			
			const filtered = students.filter(
				(s) => s.schoolId === schoolId && s.schoolYearId === schoolYearId
			);
			
			console.log('[MockStudentService] Total students:', students.length, 'Filtered:', filtered.length, 'schoolId:', schoolId, 'schoolYearId:', schoolYearId);
			
			return { success: true, data: filtered };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async getStudentById(id: string): Promise<ApiResponse<Student>> {
		try {
			const students = getStudents();
			const student = students.find((s) => s.id === id);
			
			if (!student) {
				return { success: false, error: "Étudiant non trouvé" };
			}
			
			return { success: true, data: student };
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
			const primaryGuardian = data.guardians?.find((g) => g.isEmergencyContact) || data.guardians?.[0];

			const newStudent: Student = {
				id: generateId(),
				schoolId,
				schoolYearId,
				firstName: data.firstName,
				lastName: data.lastName,
				matricule: generateMatricule(data.enrollmentType || "new"),
				gender: data.gender,
				dateOfBirth: data.dateOfBirth,
				placeOfBirth: data.placeOfBirth,
				address: data.address,
				phone: data.phone,
				email: data.email,
				guardianName: primaryGuardian?.name || data.guardianName || "",
				guardianPhone: primaryGuardian?.phone || data.guardianPhone || "",
				guardianRelation: primaryGuardian?.relation || data.guardianRelation || "",
				classId: data.classId,
				className: null,
				status: "active",
				enrollmentDate: new Date().toISOString().split("T")[0],
				enrollmentType: data.enrollmentType || "new",
				photoUrl: data.photoUrl || null,
				schoolHistory: data.schoolHistory || null,
				services: data.services || { hasTransport: false, hasCanteen: false },
				documents: data.documents || { birthCertificate: false, photoId: false, residenceCertificate: false },
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			
			saveStudent(newStudent);
			return { success: true, data: newStudent };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async updateStudent(id: string, data: Partial<StudentFormData>): Promise<ApiResponse<Student>> {
		try {
			const students = getStudents();
			const student = students.find((s) => s.id === id);
			
			if (!student) {
				return { success: false, error: "Étudiant non trouvé" };
			}
			
			const updated: Student = {
				...student,
				...data,
				updatedAt: new Date().toISOString(),
			};
			
			saveStudent(updated);
			return { success: true, data: updated };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async deleteStudent(id: string): Promise<ApiResponse<void>> {
		try {
			const students = getStudents();
			const filtered = students.filter((s) => s.id !== id);
			db.set(STUDENTS_COLLECTION, filtered);
			return { success: true };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	async getStudentStats(schoolId: string, schoolYearId: string): Promise<ApiResponse<StudentStats>> {
		try {
			const students = getStudents();
			console.log('[MockStudentService] getStudentStats - Total in DB:', students.length, 'schoolId:', schoolId, 'schoolYearId:', schoolYearId);
			
			const filtered = students.filter(
				(s) => s.schoolId === schoolId && s.schoolYearId === schoolYearId
			);
			
			console.log('[MockStudentService] getStudentStats - Filtered:', filtered.length);
			
			const total = filtered.length;
			const activeStudents = filtered.filter((s) => s.status === "active");
			const currentYear = new Date().getFullYear();
			const enrollYear = currentYear - 1;
			
			const reEnrollments = activeStudents.filter((s) => {
				const studentEnrollYear = new Date(s.enrollmentDate).getFullYear();
				return studentEnrollYear < enrollYear;
			}).length;
			
			const newEnrollments = activeStudents.length - reEnrollments;
			const withdrawn = filtered.filter((s) => s.status === "withdrawn").length;
			
			console.log('[MockStudentService] Stats - total:', total, 'active:', activeStudents.length, 'reEnroll:', reEnrollments, 'new:', newEnrollments, 'withdrawn:', withdrawn);
			
			return {
				success: true,
				data: { total, reEnrollments, newEnrollments, withdrawn },
			};
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

export const mockStudentService = new MockStudentService();
