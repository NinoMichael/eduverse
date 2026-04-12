<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores";
import { useForm } from "@/composables";
import {
	required,
	minLength,
	password,
	passwordMatch,
} from "@/utils/validation";
import Logo from "@/components/inc/Logo.vue";
import Image from "@/components/ui/Image.vue";
import bgAuth from "@/assets/images/bg-auth.png";
import type { RegisterSchoolData } from "@/types";

const router = useRouter();
const authStore = useAuthStore();

const form = useForm({
	username: "",
	password: "",
	confirmPassword: "",
});

const savedSchoolData = ref<RegisterSchoolData | null>(null);

onMounted(() => {
	const data = sessionStorage.getItem("schoolData");
	if (!data) {
		router.push("/auth/register");
		return;
	}
	savedSchoolData.value = JSON.parse(data);
});

const validationRules = computed(() => ({
	username: [
		required("Le nom d'utilisateur est requis"),
		minLength(3, "Minimum 3 caractères"),
	],
	password: [
		required("Le mot de passe est requis"),
		minLength(8, "Minimum 8 caractères"),
		password(),
	],
	confirmPassword: [
		required("La confirmation est requise"),
		passwordMatch(
			form.values.value.password,
			"Les mots de passe ne correspondent pas"
		),
	],
}));

const handleSubmit = async () => {
	if (!savedSchoolData.value) {
		router.push("/auth/register");
		return;
	}

	if (!form.validateAll(validationRules.value)) return;

	form.isSubmitting.value = true;

	const success = await authStore.register({
		school: savedSchoolData.value,
		user: {
			username: form.values.value.username,
			password: form.values.value.password,
		},
	});

	if (success) {
		sessionStorage.removeItem("schoolData");
		router.push("/auth/login");
	}

	form.isSubmitting.value = false;
};

const showError = computed(() => authStore.error);
</script>

<template>
	<main class="bg-white flex flex-row shadow rounded-lg">
		<div class="bg-primary/15 max-xs:hidden w-[45%] p-8">
			<Logo />

			<div class="mt-6">
				<h3 class="text-xl font-bold text-primary">Bienvenue !</h3>
				<p class="mt-2">Enregistrez votre école pour commencer la gestion</p>

				<Image :src="bgAuth" class="mt-6 h-64" />
			</div>
		</div>

		<form
			class="w-full max-xs:flex max-xs:flex-col max-xs:mx-auto xs:w-[55%] p-8"
			@submit.prevent="handleSubmit"
		>
			<h2 class="text-xl font-extrabold">Compte utilisateur</h2>
			<p class="opacity-70">Veuillez compléter votre information compte</p>

			<div class="mt-8 grid gap-6">
				<div class="space-y-3">
					<label class="flex items-center gap-2 font-medium opacity-90">
						<font-awesome-icon icon="user" />
						<span>Nom d'utilisateur</span>
					</label>
					<input
						v-model="form.values.value.username"
						type="text"
						placeholder="Votre nom"
						:class="[
							form.touched.value.username && form.errors.value.username
								? 'border-red-500 focus:ring-red-500/20'
								: '',
						]"
						@blur="
							form.setFieldTouched('username');
							form.validateField('username', validationRules.username);
						"
					/>
					<p
						v-if="form.touched.value.username && form.errors.value.username"
						class="text-xs text-red-500"
					>
						{{ form.errors.value.username }}
					</p>
				</div>

				<div class="space-y-3">
					<label class="flex items-center gap-2 font-medium opacity-90">
						<font-awesome-icon icon="lock" />
						<span>Mot de passe</span>
					</label>
					<input
						v-model="form.values.value.password"
						type="password"
						placeholder="Votre mot de passe"
						:class="[
							form.touched.value.password && form.errors.value.password
								? 'border-red-500 focus:ring-red-500/20'
								: '',
						]"
						@blur="
							form.setFieldTouched('password');
							form.validateField('password', validationRules.password);
						"
					/>
					<p
						v-if="form.touched.value.password && form.errors.value.password"
						class="text-xs text-red-500"
					>
						{{ form.errors.value.password }}
					</p>
				</div>

				<div class="space-y-3">
					<label class="flex items-center gap-2 font-medium opacity-90">
						<font-awesome-icon icon="lock" />
						<span>Confirmer mot de passe</span>
					</label>
					<input
						v-model="form.values.value.confirmPassword"
						type="password"
						placeholder="Confirmer mot de passe"
						:class="[
							form.touched.value.confirmPassword &&
							form.errors.value.confirmPassword
								? 'border-red-500 focus:ring-red-500/20'
								: '',
						]"
						@blur="
							form.setFieldTouched('confirmPassword');
							form.validateField(
								'confirmPassword',
								validationRules.confirmPassword
							);
						"
					/>
					<p
						v-if="
							form.touched.value.confirmPassword &&
							form.errors.value.confirmPassword
						"
						class="text-xs text-red-500"
					>
						{{ form.errors.value.confirmPassword }}
					</p>
				</div>
			</div>

			<div
				v-if="showError"
				class="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm"
			>
				{{ showError }}
			</div>

			<button
				type="submit"
				class="mt-8 bg-primary hover:bg-primary/90 text-white w-full"
			>
				<span
					v-if="form.isSubmitting.value"
					class="flex items-center justify-center gap-2"
				>
					<font-awesome-icon icon="spinner" class="animate-spin" />
					Chargement...
				</span>
				<span v-else>Terminer</span>
			</button>
		</form>
	</main>
</template>
