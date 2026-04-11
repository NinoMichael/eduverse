<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores";
import { useRouter, useRoute } from "vue-router";
import { useLayout } from "@/composables/useLayout";
import { navItems } from "@/utils/menu";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const { sidebarState } = useLayout();

const showUserMenu = ref(false);
const showMobileMenu = ref(false);

const activeRoute = computed(() => route.path);

const toggleUserMenu = () => {
	showUserMenu.value = !showUserMenu.value;
};

const toggleMobileMenu = () => {
	showMobileMenu.value = !showMobileMenu.value;
};

const closeMobileMenu = () => {
	showMobileMenu.value = false;
};

const navigateTo = (path: string) => {
	router.push(path);
	closeMobileMenu();
	showUserMenu.value = false;
};

const handleLogout = () => {
	authStore.logout();
	router.push("/auth/login");
};
</script>

<template>
	<header class="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
		<div class="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-4">
			<div class="flex items-center gap-3">
				<font-awesome-icon
					icon="bars"
					v-if="sidebarState.isMobile"
					@click="toggleMobileMenu"
					class="text-gray-600 cursor-pointer p-2 transition-colors hover:bg-gray-100 rounded-lg text-lg"
				/>
				<div class="lg:flex-1">
					<h1 class="text-lg lg:text-2xl font-bold text-gray-800 truncate">
						<slot name="title">Tableau de bord</slot>
					</h1>
					<p class="text-xs lg:text-sm text-gray-500 hidden sm:block">
						<slot name="subtitle">Bienvenue sur votre espace de gestion</slot>
					</p>
				</div>
			</div>

			<div class="flex items-center gap-2 lg:gap-4">
				<button
					class="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
					title="Notifications"
				>
					<font-awesome-icon icon="bell" class="text-gray-600" />
					<span
						class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
					></span>
				</button>

				<div class="relative">
					<button
						class="flex items-center gap-2 hover:bg-gray-100 rounded-lg p-1.5 lg:p-2 transition-colors"
						@click="toggleUserMenu"
					>
						<div
							class="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-primary/10 flex items-center justify-center"
						>
							<font-awesome-icon
								icon="user"
								class="text-primary text-sm lg:text-base"
							/>
						</div>
						<div class="text-left hidden sm:block">
							<p
								class="font-semibold text-gray-800 text-xs lg:text-sm max-w-36 truncate"
							>
								{{ authStore.user?.username || "Administrateur" }}
							</p>
							<p
								class="text-xs text-gray-500 capitalize max-w-36 truncate hidden lg:block"
							>
								{{ authStore.school?.name || "École" }}
							</p>
						</div>
						<font-awesome-icon
							icon="chevron-down"
							class="text-gray-400 text-xs hidden sm:block"
						/>
					</button>

					<transition name="fade">
						<div
							v-if="showUserMenu"
							class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
						>
							<button
								class="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors w-full text-left"
								@click="navigateTo('/dashboard/settings')"
							>
								<font-awesome-icon icon="user-circle" class="text-gray-400" />
								Profil
							</button>
							<button
								class="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors w-full text-left"
								@click="navigateTo('/dashboard/settings')"
							>
								<font-awesome-icon icon="cog" class="text-gray-400" />
								Paramètres
							</button>
							<hr class="my-1 border-gray-200" />
							<button
								class="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
								@click="handleLogout"
							>
								<font-awesome-icon icon="sign-out-alt" class="text-gray-400" />
								Déconnexion
							</button>
						</div>
					</transition>
				</div>
			</div>
		</div>

		<teleport to="body">
			<transition name="overlay">
				<div
					v-if="showMobileMenu && sidebarState.isMobile"
					class="fixed inset-0 bg-black/50 z-40"
					@click="closeMobileMenu"
				></div>
			</transition>

			<transition name="slide">
				<div
					v-if="showMobileMenu && sidebarState.isMobile"
					class="fixed left-0 top-0 h-full w-64 bg-primary text-white z-50 flex flex-col shadow-xl"
				>
					<div
						class="p-4 flex items-center justify-between border-b border-white/10"
					>
						<div class="flex items-center gap-3">
							<div
								class="bg-white/20 p-1.5 rounded-lg flex items-center justify-center"
							>
								<font-awesome-icon
									class="text-white text-sm"
									icon="graduation-cap"
								/>
							</div>
							<span class="uppercase tracking-widest text-sm font-extrabold">
								eduverse
							</span>
						</div>
						<button
							class="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
							@click="closeMobileMenu"
						>
							<font-awesome-icon icon="times" class="text-sm" />
						</button>
					</div>

					<nav class="flex-1 py-3 overflow-y-auto">
						<ul class="space-y-0.5 px-2">
							<li v-for="item in navItems" :key="item.route">
								<button
									class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left text-sm"
									:class="[
										activeRoute === item.route
											? 'bg-white/20'
											: 'hover:bg-white/10',
									]"
									@click="navigateTo(item.route)"
								>
									<font-awesome-icon
										:icon="item.icon"
										class="w-4 text-center"
									/>
									<span class="font-medium">{{ item.label }}</span>
								</button>
							</li>
						</ul>
					</nav>

					<div class="p-3 border-t border-white/10">
						<button
							class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors w-full text-left text-sm"
							@click="handleLogout"
						>
							<font-awesome-icon icon="sign-out-alt" class="w-4 text-center" />
							<span class="font-medium">Déconnexion</span>
						</button>
					</div>
				</div>
			</transition>
		</teleport>
	</header>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
	transform: translateY(-10px);
}

.overlay-enter-active,
.overlay-leave-active {
	transition: opacity 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
	opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
	transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
	transform: translateX(-100%);
}
</style>
