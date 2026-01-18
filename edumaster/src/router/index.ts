import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';

import Auth from '../layouts/auth.vue';

import Login from '../views/auth/login.vue';

/** Declare routes for dedicated pages */
const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/auth/login',
    },
    {
        path: '/auth/',
        component: Auth,
        children: [
            { path: 'login', name: 'Login', component: Login },
        ]
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

export default router;