<script setup lang="ts">
import { ref, onMounted } from "vue";
import Logo from "@/components/inc/Logo.vue";

const emit = defineEmits<{
	done: [];
}>();

const isVisible = ref(true);
const isFading = ref(false);
const isLoading = ref(true);

onMounted(() => {
	setTimeout(() => {
		isLoading.value = false;
		setTimeout(() => {
			isFading.value = true;
			setTimeout(() => {
				isVisible.value = false;
				emit("done");
			}, 800);
		}, 600);
	}, 2000);
});
</script>

<template>
	<Transition name="splash">
		<div
			v-if="isVisible"
			class="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-linear-to-br from-white via-gray-50 to-primary/5"
		>
			<div class="relative flex flex-col items-center gap-10">
				<div class="relative">
					<div
						class="absolute inset-0 bg-primary/30 rounded-full blur-3xl scale-125 animate-pulse"
					/>
					<div
						class="relative bg-white shadow-2xl rounded-3xl p-6 flex items-center justify-center"
					>
						<div
							class="w-28 h-28 bg-primary rounded-2xl flex items-center justify-center shadow-lg"
							:class="{ 'animate-[bounce_1s_ease-in-out_infinite]': isLoading }"
						>
							<font-awesome-icon
								icon="graduation-cap"
								class="text-white text-5xl"
								:class="{ 'animate-pulse': isLoading }"
							/>
						</div>
					</div>
				</div>

				<div class="flex flex-col items-center gap-4">
					<Logo />
					<span
						v-if="isLoading"
						class="text-gray-400 text-sm font-medium flex items-center gap-2"
					>
						<font-awesome-icon
							icon="spinner"
							class="animate-spin text-primary"
						/>
						Chargement...
					</span>
				</div>

				<div v-if="!isLoading" class="flex items-center gap-2">
					<div
						class="w-2 h-2 bg-primary rounded-full animate-bounce"
						style="animation-delay: 0ms"
					/>
					<div
						class="w-2 h-2 bg-primary rounded-full animate-bounce"
						style="animation-delay: 150ms"
					/>
					<div
						class="w-2 h-2 bg-primary rounded-full animate-bounce"
						style="animation-delay: 300ms"
					/>
				</div>
			</div>
		</div>
	</Transition>
</template>

<style scoped>
.splash-enter-active {
	transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.splash-leave-active {
	transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

.splash-enter-from {
	opacity: 0;
	transform: scale(0.9);
}

.splash-leave-to {
	opacity: 0;
	transform: scale(1.1) translateY(-30px);
}

@keyframes bounce {
	0%,
	100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-8px);
	}
}

.animate-bounce {
	animation: bounce 0.8s ease-in-out infinite;
}
</style>
