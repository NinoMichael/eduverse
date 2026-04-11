<script setup lang="ts">
import { ref, provide } from "vue";

const isTransitioning = ref(false);
const transitionName = ref("fade");

provide("pageTransition", {
	isTransitioning,
	transitionName,
});

function startTransition(name = "fade") {
	transitionName.value = name;
	isTransitioning.value = true;
	setTimeout(() => {
		isTransitioning.value = false;
	}, 300);
}

defineExpose({
	startTransition,
});
</script>

<template>
	<router-view v-slot="{ Component, route }">
		<transition :name="transitionName" mode="out-in">
			<component :is="Component" :key="route.path" />
		</transition>
	</router-view>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
	opacity: 0;
	transform: translateX(20px);
}

.fade-leave-to {
	opacity: 0;
	transform: translateX(-20px);
}

.slide-up-enter-active,
.slide-up-leave-active {
	transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
	opacity: 0;
	transform: translateY(30px);
}

.slide-up-leave-to {
	opacity: 0;
	transform: translateY(-30px);
}

.scale-enter-active,
.scale-leave-active {
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.scale-enter-from {
	opacity: 0;
	transform: scale(0.95);
}

.scale-leave-to {
	opacity: 0;
	transform: scale(1.05);
}
</style>
