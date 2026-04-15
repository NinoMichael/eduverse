<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";
import { useStudentStore } from "@/stores/student.store";
import { useSchoolYearStore } from "@/stores/school-year.store";
import type { StudentSchoolPath } from "@/types/student";

const props = defineProps<{
	studentId: string;
}>();

const studentStore = useStudentStore();
const schoolYearStore = useSchoolYearStore();

const schoolPath = ref<StudentSchoolPath | null>(null);
const isLoading = ref(false);

const currentClass = ref("-");

const fetchSchoolPath = async () => {
	isLoading.value = true;
	schoolPath.value = await studentStore.fetchStudentSchoolPath(props.studentId);
	if (schoolPath.value?.currentEnrollment.className) {
		currentClass.value = schoolPath.value.currentEnrollment.className;
	} else if (schoolPath.value?.enrollmentHistory.length) {
		const last = schoolPath.value.enrollmentHistory[schoolPath.value.enrollmentHistory.length - 1];
		currentClass.value = last.className || "Non classé";
	}
	isLoading.value = false;
};

onMounted(async () => {
	await schoolYearStore.fetchSchoolYears();
	await fetchSchoolPath();
});

watch(() => props.studentId, fetchSchoolPath);
</script>

<template>
	<div v-if="isLoading" class="flex justify-center py-12">
		<span class="loading loading-spinner loading-lg text-primary"></span>
	</div>

	<div v-else-if="!schoolPath" class="text-center py-12">
		<p class="text-gray-500">Aucune donnée de parcours disponible</p>
	</div>

	<div v-else class="space-y-6">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div class="bg-white space-y-6 p-6 rounded-lg border-l-4 border-primary shadow">
				<h2 class="text-base font-bold">
					<font-awesome-icon icon="book-open" class="mr-2" />
					<span>Classe actuelle</span>
				</h2>
				<div class="w-full bg-gray-100 rounded-lg flex gap-4 p-6 items-center">
					<font-awesome-icon
						icon="graduation-cap"
						class="bg-primary text-white rounded-lg p-2 text-2xl"
					/>
					<div class="space-y-1">
						<h5 class="uppercase text-xs tracking-widest">classe</h5>
						<span class="font-extrabold text-lg">{{ currentClass }}</span>
					</div>
				</div>
				<div class="space-y-1">
					<h5 class="uppercase text-xs tracking-widest">redoublement</h5>
					<span>{{ schoolPath.isRepeating ? "Oui" : "Non" }}</span>
				</div>
			</div>

			<div class="bg-white space-y-6 p-6 rounded-lg border-l-4 border-primary shadow">
				<h2 class="text-base font-bold">
					<font-awesome-icon icon="web-awesome" class="mr-2" />
					<span>Diplômes obtenus</span>
				</h2>
				<div class="space-y-3">
					<div
						v-for="item in schoolPath.enrollmentHistory.filter(h => h.results)"
						:key="item.schoolYearId"
						class="bg-gray-100 border border-gray-200 p-6 rounded-lg flex gap-4 items-center"
					>
						<font-awesome-icon
							icon="award"
							class="bg-primary/20 text-primary text-xl p-2 rounded-lg"
						/>
						<div class="space-y-1">
							<h6 class="uppercase font-medium">{{ item.results }}</h6>
							<p class="font-semibold text-gray-500">{{ item.schoolYearName }}</p>
						</div>
					</div>
					<p
						v-if="schoolPath.enrollmentHistory.filter(h => h.results).length === 0"
						class="text-gray-400 text-sm italic"
					>
						Aucun diplôme obtenu
					</p>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-lg p-6 border-l-4 border-primary shadow">
			<h3 class="text-base font-extrabold mb-8">
				<font-awesome-icon icon="route" class="mr-2 text-primary" />
				<span>Historique de classes</span>
			</h3>

			<div
				v-if="schoolPath.enrollmentHistory.length === 0"
				class="text-center py-8 text-gray-500"
			>
				Aucun historique disponible
			</div>

			<div v-else class="relative">
				<div
					class="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 -translate-x-1/2 hidden md:block"
				></div>

				<div class="space-y-8 md:space-y-0">
					<div
						v-for="(item, index) in schoolPath.enrollmentHistory"
						:key="item.schoolYearId"
						:class="['relative flex flex-col md:flex-row items-start gap-4']"
					>
						<div
							:class="[
								'flex-1 w-full',
								index % 2 === 0
									? 'md:pr-[calc(50%+2rem)] md:text-right'
									: 'md:pl-[calc(50%+2rem)]',
							]"
						>
							<div
								class="inline-block bg-white border-2 border-primary/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow w-full max-w-sm"
								:class="index % 2 === 0 ? 'md:float-right' : ''"
							>
								<div class="space-y-3">
									<div
										class="flex items-center gap-2 flex-wrap"
										:class="index % 2 === 0 ? 'md:flex-row-reverse' : ''"
									>
										<span class="text-xs font-bold text-primary uppercase tracking-wider">
											{{ item.schoolYearName }}
										</span>
										<span
											v-if="schoolPath.repeatingYears.includes(item.schoolYearName)"
											class="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium"
											title="Redoublement"
										>
											<font-awesome-icon icon="repeat" class="text-[0.6rem]" />
											Redoublement
										</span>
									</div>

									<div
										class="flex items-center gap-2"
										:class="index % 2 === 0 ? 'md:flex-row-reverse' : ''"
									>
										<font-awesome-icon
											icon="chalkboard-user"
											class="text-gray-400 text-sm"
										/>
										<span class="font-semibold text-gray-800 text-base">
											{{ item.className || "Non classé" }}
										</span>
									</div>

									<span
										:class="[
											'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold',
											item.results ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600',
										]"
									>
										<font-awesome-icon v-if="item.results" icon="medal" class="text-[0.6rem]" />
										{{ item.results || "En cours" }}
									</span>
								</div>

								<div class="md:hidden flex items-center gap-2 mt-4">
									<div class="flex-1 h-px bg-primary/20"></div>
									<div
										class="w-6 h-6 rounded-full bg-white border-2 border-primary flex items-center justify-center shrink-0"
									>
										<span class="text-[0.5rem] font-bold text-primary">{{
											index + 1
										}}</span>
									</div>
									<div class="flex-1 h-px bg-primary/20"></div>
								</div>
							</div>
						</div>

						<div
							class="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border-4 border-primary z-10 items-center justify-center"
						>
							<span class="text-xs font-bold text-primary">{{
								index + 1
							}}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
