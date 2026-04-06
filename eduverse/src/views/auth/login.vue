<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores";
import { useForm } from "@/composables";
import { required } from "@/utils/validation";
import Logo from "@/components/inc/Logo.vue";

const router = useRouter();
const authStore = useAuthStore();

const form = useForm({
	identifier: "",
	password: "",
});

const validationRules = {
	identifier: [required("L'identifiant est requis")],
	password: [required("Le mot de passe est requis")],
};

const handleSubmit = async () => {
	if (!form.validateAll(validationRules)) return;

	form.isSubmitting.value = true;
	const success = await authStore.login({
		identifier: form.values.value.identifier,
		password: form.values.value.password,
	});

	if (success) {
		router.push("/dashboard");
	}
	form.isSubmitting.value = false;
};

const showError = computed(() => authStore.error);
</script>

<template>
	<main class="bg-white shadow rounded-lg max-w-lg flex justify-center mx-auto">
		<form class="flex flex-col gap-4">
			<div
				class="flex justify-between items-center py-4 px-8 border-b border-primary/20"
			>
				<Logo />
				<font-awesome-icon
					icon="info-circle"
					class="w-fit bg-primary/15 text-primary text-center p-2 rounded-full cursor-pointer hover:scale-105 hover:transition-all"
					title="Contactez le support pour plus d'informations"
				/>
			</div>

			<div
				class="my-4 px-8 border-8 border-primary/20 w-24 h-24 rounded-full shadow flex justify-center items-center mx-auto relative"
			>
				<font-awesome-icon
					icon="robot"
					class="text-2xl text-primary text-center"
				/>

				<font-awesome-icon
					icon="rocket"
					class="absolute -bottom-8 -right-6 w-fit bg-primary text-white text-center p-2 rounded-full cursor-pointer hover:scale-105 hover:transition-all"
				/>
			</div>

			<div class="py-2 flex flex-col gap-2 justify-center items-center mx-8">
				<h1 class="text-xl font-bold">Bienvenue !</h1>
				<p>Connectez-vous pour commencer</p>
			</div>

			<div class="pb-6 flex flex-col gap-6 justify-center items-center mx-8">
				<div class="space-y-3 w-full sm:w-96">
					<label class="flex items-center gap-2 font-medium opacity-90">
						<font-awesome-icon icon="user" />
						<span>Identifiant</span>
					</label>
					<input
						v-model="form.values.value.identifier"
						type="text"
						placeholder="Votre nom d'utilisateur"
						:class="[
							form.touched.value.identifier && form.errors.value.identifier
								? 'border-red-500 focus:ring-red-500/20'
								: '',
						]"
						@blur="
							form.setFieldTouched('identifier');
							form.validateField('identifier', validationRules.identifier);
						"
					/>
					<p
						v-if="form.touched.value.identifier && form.errors.value.identifier"
						class="text-xs text-red-500"
					>
						{{ form.errors.value.identifier }}
					</p>
				</div>
				<div class="space-y-3 w-full sm:w-96">
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
			</div>

			<div
				class="mb-8 flex gap-6 justify-center items-center mx-8 sm:mx-auto sm:w-96"
			>
				<button
					type="button"
					:disabled="form.isSubmitting.value"
					class="bg-primary hover:bg-primary/90 text-white"
					@click="handleSubmit"
				>
					<span
						v-if="form.isSubmitting.value"
						class="flex items-center justify-center gap-2"
					>
						<font-awesome-icon icon="spinner" class="animate-spin" />
						Chargement...
					</span>
					<span v-else>Se connecter</span>
				</button>
			</div>

			<div
				v-if="showError"
				class="mx-8 mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm"
			>
				{{ showError }}
			</div>
		</form>
	</main>
</template>
