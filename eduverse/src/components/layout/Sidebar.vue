<script setup lang="ts">
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores";
import { useLayout } from "@/composables/useLayout";
import { navItems } from "@/utils/menu";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { sidebarState, toggleSidebar } = useLayout();

const activeRoute = computed(() => route.path);

const handleLogout = () => {
	authStore.logout();
	router.push("/auth/login");
};
</script>

<template>
	<aside
		v-if="!sidebarState.isMobile"
		class="fixed left-0 top-0 h-screen bg-primary text-white flex flex-col z-40 transition-all duration-300"
		:style="{ width: sidebarState.width + 'px' }"
	>
		<div
			class="p-4 flex items-center justify-between border-b border-white/10 min-h-16"
		>
			<button
				class="flex items-center gap-3 hover:bg-white/10 rounded-lg p-2 -m-2 transition-colors cursor-pointer"
				:class="{ 'justify-center w-full': sidebarState.isCollapsed }"
				@click="toggleSidebar"
			>
				<div
					class="p-2 rounded-lg flex items-center justify-center bg-white/20"
				>
					<font-awesome-icon class="text-white" icon="graduation-cap" />
				</div>
				<span
					v-if="!sidebarState.isCollapsed"
					class="uppercase tracking-widest text-lg font-extrabold"
					>eduverse</span
				>
			</button>
		</div>

		<nav class="flex-1 py-4 overflow-y-auto">
			<ul class="space-y-1 px-3">
				<li v-for="item in navItems" :key="item.route">
					<router-link
						:to="item.route"
						class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
						:class="
							activeRoute === item.route ? 'bg-white/20' : 'hover:bg-white/10'
						"
						:title="sidebarState.isCollapsed ? item.label : undefined"
					>
						<font-awesome-icon :icon="item.icon" class="w-5 text-center" />
						<span v-if="!sidebarState.isCollapsed" class="font-medium">{{
							item.label
						}}</span>
					</router-link>
				</li>
			</ul>
		</nav>

		<div class="p-4 border-t border-white/10">
			<button
				class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors w-full"
				@click="handleLogout"
				:title="sidebarState.isCollapsed ? 'Déconnexion' : undefined"
			>
				<font-awesome-icon icon="sign-out-alt" class="w-5 text-center" />
				<span v-if="!sidebarState.isCollapsed" class="font-medium"
					>Déconnexion</span
				>
			</button>
		</div>
	</aside>
</template>
