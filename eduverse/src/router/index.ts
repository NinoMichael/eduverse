import {
	createRouter,
	createWebHashHistory,
	type RouteRecordRaw,
} from "vue-router";

import Auth from "../layouts/auth.vue";

import Register from "../views/auth/register.vue";
import RegisterInfo from "../views/auth/register-info.vue";
import Login from "../views/auth/login.vue";

/** Declare routes for dedicated pages */
const routes: RouteRecordRaw[] = [
	{
		path: "/",
		redirect: "/auth/register",
	},
	{
		path: "/auth/",
		component: Auth,
		children: [{ path: "login", name: "Login", component: Login }],
	},
	{
		path: "/auth/",
		component: Auth,
		children: [{ path: "register", name: "Register", component: Register }],
	},
	{
		path: "/auth/",
		component: Auth,
		children: [
			{ path: "register-info", name: "RegisterInfo", component: RegisterInfo },
		],
	},
];

const router = createRouter({
	history: createWebHashHistory(),
	routes,
});

export default router;
