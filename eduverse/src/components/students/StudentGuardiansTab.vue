<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";
import { unifiedGuardianService } from "@/services/unified.service";
import type { Guardian } from "@/types/student";

const props = defineProps<{
	studentId: string;
}>();

const guardians = ref<Guardian[]>([]);
const isLoading = ref(false);

const fetchGuardians = async () => {
	isLoading.value = true;
	const response = await unifiedGuardianService.getGuardiansByStudentId(props.studentId);
	if (response.success && response.data) {
		guardians.value = response.data;
	}
	isLoading.value = false;
};

onMounted(() => {
	fetchGuardians();
});

watch(() => props.studentId, fetchGuardians);
</script>

<template>
	<div v-if="isLoading" class="flex justify-center py-12">
		<span class="loading loading-spinner loading-lg text-primary"></span>
	</div>

	<div v-else-if="guardians.length === 0" class="text-center py-12">
		<p class="text-gray-500">Aucun responsable enregistré</p>
	</div>

	<section v-else class="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
		<div
			v-for="guardian in guardians"
			:key="guardian.id"
			class="relative bg-white rounded-lg p-6 border-l-4 border-primary shadow"
		>
			<font-awesome-icon
				v-if="guardian.isEmergencyContact"
				icon="star"
				class="text-primary/50 absolute top-8 right-4"
			/>

			<div class="flex gap-4 items-center">
				<font-awesome-icon
					icon="user"
					class="text-xl text-primary p-2 bg-gray-200 rounded-lg"
				/>
				<p class="font-semibold">{{ guardian.name }}</p>
			</div>

			<div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
				<div>
					<h6
						class="uppercase font-semibold text-xs tracking-widest opacity-70"
					>
						lien
					</h6>
					<p class="font-medium">{{ guardian.relation }}</p>
				</div>
				<div>
					<h6
						class="uppercase font-semibold text-xs tracking-widest opacity-70"
					>
						téléphone
					</h6>
					<p class="font-medium">{{ guardian.phone }}</p>
				</div>
				<div>
					<h6
						class="uppercase font-semibold text-xs tracking-widest opacity-70"
					>
						Profession
					</h6>
					<p class="font-medium">{{ guardian.profession || "-" }}</p>
				</div>
			</div>
		</div>
	</section>
</template>
