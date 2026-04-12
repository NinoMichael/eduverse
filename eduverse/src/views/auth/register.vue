<script setup lang="ts">
import { useRouter } from "vue-router";
import { useForm } from "@/composables";
import { required, minLength } from "@/utils/validation";
import { SCHOOL_TYPES } from "@/types";
import type { SchoolType } from "@/types";
import Logo from "@/components/inc/Logo.vue";
import Image from "@/components/ui/Image.vue";

import bgAuth from "@/assets/images/bg-auth.png";

const router = useRouter();

const form = useForm({
	name: "",
	address: "",
	type: "" as SchoolType,
});

const validationRules = {
	name: [required("Le nom de l'établissement est requis"), minLength(3)],
	address: [required("L'adresse est requise"), minLength(5)],
	type: [required("Le type d'établissement est requis")],
};

const handleSubmit = () => {
	if (!form.validateAll(validationRules)) return;

	sessionStorage.setItem(
		"schoolData",
		JSON.stringify({
			name: form.values.value.name,
			address: form.values.value.address,
			type: form.values.value.type,
		})
	);

	router.push("/auth/register-info");
};
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
			<h2 class="text-xl font-extrabold">Détails de l'établissement</h2>
			<p class="opacity-70">Veuillez remplir vos informations officielles</p>

			<div class="mt-8 grid gap-6">
				<div class="space-y-3">
					<label class="flex items-center gap-2 font-medium opacity-90">
						<font-awesome-icon icon="school" />
						<span>Nom de l'établissement</span>
					</label>
					<input
						v-model="form.values.value.name"
						type="text"
						placeholder="École privée Les Chérubins"
						:class="[
							form.touched.value.name && form.errors.value.name
								? 'border-red-500 focus:ring-red-500/20'
								: '',
						]"
						@blur="
							form.setFieldTouched('name');
							form.validateField('name', validationRules.name);
						"
					/>
					<p
						v-if="form.touched.value.name && form.errors.value.name"
						class="text-xs text-red-500"
					>
						{{ form.errors.value.name }}
					</p>
				</div>

				<div class="space-y-3">
					<label class="flex items-center gap-2 font-medium opacity-90">
						<font-awesome-icon icon="location-dot" />
						<span>Adresse physique</span>
					</label>
					<input
						v-model="form.values.value.address"
						type="text"
						placeholder="Lot 123 Ankadilalana"
						:class="[
							form.touched.value.address && form.errors.value.address
								? 'border-red-500 focus:ring-red-500/20'
								: '',
						]"
						@blur="
							form.setFieldTouched('address');
							form.validateField('address', validationRules.address);
						"
					/>
					<p
						v-if="form.touched.value.address && form.errors.value.address"
						class="text-xs text-red-500"
					>
						{{ form.errors.value.address }}
					</p>
				</div>

				<div class="space-y-3">
					<label class="flex items-center gap-2 font-medium opacity-90">
						<font-awesome-icon icon="book-open" />
						<span>Type d'établissement</span>
					</label>
					<select
						v-model="form.values.value.type"
						:class="[
							form.touched.value.type && form.errors.value.type
								? 'border-red-500 focus:ring-red-500/20'
								: '',
						]"
						@blur="
							form.setFieldTouched('type');
							form.validateField('type', validationRules.type);
						"
					>
						<option value="">Sélectionner</option>
						<option
							v-for="st in SCHOOL_TYPES"
							:key="st.value"
							:value="st.value"
						>
							{{ st.label }}
						</option>
					</select>
					<p
						v-if="form.touched.value.type && form.errors.value.type"
						class="text-xs text-red-500"
					>
						{{ form.errors.value.type }}
					</p>
				</div>
			</div>

			<button
				type="submit"
				class="mt-8 bg-primary hover:bg-primary/90 text-white w-full"
			>
				Créer l'espace
			</button>
		</form>
	</main>
</template>
