import {
	createRouter,
	createWebHashHistory,
	type RouteRecordRaw,
} from "vue-router";

import Auth from "../layouts/auth.vue";
import Workspace from "../layouts/workspace.vue";

import Register from "@/views/auth/register.vue";
import RegisterInfo from "@/views/auth/register-info.vue";
import Login from "@/views/auth/login.vue";
import ActivateSoftware from "@/views/auth/activate-software.vue";

import DashboardIndex from "@/views/dashboard/index.vue";

import SchoolYearList from "@/views/dashboard/school-year/list.vue";
import SchoolYearCreate from "@/views/dashboard/school-year/create.vue";
import SchoolYearConfigureEvent from "@/views/dashboard/school-year/configure-event.vue";

import StudentsList from "@/views/dashboard/students/list.vue";
import StudentsCreate from "@/views/dashboard/students/create.vue";
import StudentsEdit from "@/views/dashboard/students/edit.vue";
import StudentsFile from "@/views/dashboard/students/file.vue";

import DashboardTeachers from "@/views/dashboard/teachers.vue";
import DashboardClasses from "@/views/dashboard/classes.vue";
import DashboardAttendance from "@/views/dashboard/attendance.vue";
import DashboardGrades from "@/views/dashboard/grades.vue";
import DashboardSchedule from "@/views/dashboard/schedule.vue";
import DashboardSettings from "@/views/dashboard/settings.vue";

function isSoftwareActivated(): boolean {
	return localStorage.getItem("eduverse_license") !== null;
}

function isFirstTimeUser(): boolean {
	return localStorage.getItem("eduverse_setup_complete") === null;
}

function isAuthenticated(): boolean {
	return localStorage.getItem("eduverse_token") !== null;
}

const routes: RouteRecordRaw[] = [
	{
		path: "/",
		redirect: () => {
			if (!isSoftwareActivated()) {
				return "/activation";
			}
			if (isFirstTimeUser()) {
				return "/auth/register";
			}
			if (isAuthenticated()) {
				return "/dashboard";
			}
			return "/auth/login";
		},
	},
	{
		path: "/activation",
		name: "Activation",
		component: Auth,
		children: [
			{
				path: "",
				component: ActivateSoftware,
			},
		],
	},
	{
		path: "/auth/",
		component: Auth,
		children: [
			{
				path: "",
				redirect: () => {
					if (!isSoftwareActivated()) {
						return "/activation";
					}
					if (isFirstTimeUser()) {
						return "/auth/register";
					}
					return "/auth/login";
				},
			},
			{ path: "login", name: "Login", component: Login },
			{ path: "register", name: "Register", component: Register },
			{ path: "register-info", name: "RegisterInfo", component: RegisterInfo },
		],
	},
	{
		path: "/dashboard",
		component: Workspace,
		meta: { requiresAuth: true },
		children: [
			{
				path: "",
				name: "Dashboard",
				component: DashboardIndex,
			},
			{
				path: "school-year/list",
				name: "CreateSchoolYears",
				component: SchoolYearList,
			},
			{
				path: "school-year/create",
				name: "CreateSchoolYear",
				component: SchoolYearCreate,
			},
			{
				path: "school-year/edit/:id",
				name: "EditSchoolYear",
				component: SchoolYearCreate,
			},
			{
				path: "school-year/event/configure",
				name: "ConfigureEventSchoolYears",
				component: SchoolYearConfigureEvent,
			},
			{
				path: "students/list",
				name: "ListStudents",
				component: StudentsList,
			},
			{
				path: "students/create",
				name: "CreateStudent",
				component: StudentsCreate,
			},
			{
				path: "students/edit/:id",
				name: "EditStudent",
				component: StudentsEdit,
			},
			{
				path: "students/file/:id",
				name: "FileStudent",
				component: StudentsFile,
			},
			{
				path: "teachers",
				name: "DashboardTeachers",
				component: DashboardTeachers,
			},
			{
				path: "classes",
				name: "DashboardClasses",
				component: DashboardClasses,
			},
			{
				path: "attendance",
				name: "DashboardAttendance",
				component: DashboardAttendance,
			},
			{
				path: "grades",
				name: "DashboardGrades",
				component: DashboardGrades,
			},
			{
				path: "schedule",
				name: "DashboardSchedule",
				component: DashboardSchedule,
			},
			{
				path: "settings",
				name: "DashboardSettings",
				component: DashboardSettings,
			},
		],
	},
];

const router = createRouter({
	history: createWebHashHistory(),
	routes,
	scrollBehavior() {
		return { top: 0 };
	},
});

router.beforeEach((to, _from, next) => {
	if (to.path === "/activation") {
		if (isSoftwareActivated()) {
			if (isFirstTimeUser()) {
				return next("/auth/register");
			}
			return next("/auth/login");
		}
		return next();
	}

	if (!isSoftwareActivated() && to.path !== "/activation") {
		return next("/activation");
	}

	if (to.meta.requiresAuth && !isAuthenticated()) {
		return next("/auth/login");
	}

	if (
		isAuthenticated() &&
		(to.path === "/auth/login" ||
			to.path === "/auth/register" ||
			to.path === "/activation")
	) {
		return next("/dashboard");
	}

	next();
});

export default router;
