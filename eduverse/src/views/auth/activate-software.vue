<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { unifiedActivationService } from "@/services/unified.service";
import { useToast } from "@/composables/useToast";

const router = useRouter();
const toast = useToast();

const privateKey = ref("");
const isLoading = ref(false);
const error = ref("");

const handleActivate = async () => {
	if (!privateKey.value.trim()) {
		error.value = "Veuillez saisir la clé";
		toast.error("Veuillez saisir la clé");
		return;
	}

	isLoading.value = true;
	error.value = "";

	const response = await unifiedActivationService.activate(privateKey.value);

	if (response.success) {
		toast.success("Logiciel activé avec succès!");
		setTimeout(() => {
			router.push("/auth/register");
		}, 800);
	} else {
		error.value = response.message;
		toast.error(response.message);
	}

	isLoading.value = false;
};
</script>

<template>
	<main class="max-w-lg flex flex-col justify-center gap-8 mx-auto">
		<form
			class="relative bg-white border-l-6 border-primary shadow rounded-lg flex flex-col gap-4 p-8"
			@submit.prevent="handleActivate"
		>
			<font-awesome-icon
				icon="lock"
				class="absolute top-0 right-0 text-3xl bg-primary/20 p-4 rounded-full text-primary/60"
			/>

			<font-awesome-icon
				icon="key"
				class="w-fit text-2xl bg-primary/20 p-3 rounded-lg text-primary"
			/>

			<div class="mt-4 space-y-2">
				<h1 class="text-xl font-extrabold">Activation de votre espace</h1>
				<p>Veuillez saisir votre clé privée pour déverrouiller le logiciel</p>
			</div>

			<div
				v-if="error"
				class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
			>
				{{ error }}
			</div>

			<div class="mt-4">
				<label
					class="font-extrabold text-xs opacity-70 uppercase tracking-widest"
				>
					Clé d'accès
				</label>
				<input
					v-model="privateKey"
					type="password"
					placeholder="••••••••••••"
					class="mt-2"
				/>
			</div>

			<div class="mt-4">
				<button
					type="submit"
					:disabled="isLoading"
					class="w-full flex justify-center gap-4 items-center bg-primary hover:bg-primary/90 disabled:bg-gray-300 text-white"
				>
					<font-awesome-icon
						v-if="isLoading"
						icon="spinner"
						class="animate-spin"
					/>
					<span v-if="!isLoading">Activer maintenant</span>
					<span v-else>Activation...</span>
					<font-awesome-icon v-if="!isLoading" icon="arrow-right" />
				</button>
			</div>

			<div class="my-4 border border-primary/10" />

			<div class="flex gap-4 items-center">
				<font-awesome-icon
					icon="info-circle"
					class="text-red-800 bg-red-800/10 p-2 rounded-full w-fit"
				/>

				<p>
					<span
						>La clé se trouve dans le fichier .txt fourni dans le package
						logiciel livré</span
					>
				</p>
			</div>
		</form>

		<div class="flex flex-col justify-center items-center xs:w-96 mx-auto">
			<span class="uppercase font-extrabold tracking-widest text-xs opacity-70"
				>besoin d'aide</span
			>
			<button
				type="button"
				class="flex justify-center gap-4 items-center bg-gray-100 hover:bg-gray-200/90 border border-gray-200 rounded-lg mt-4"
			>
				<font-awesome-icon icon="robot" />
				<span>Contacter le support technique</span>
			</button>
		</div>
	</main>
</template>
