<script setup lang="ts">
import { ref, onMounted } from "vue";
import "./index.css";
import SplashScreen from "./components/SplashScreen.vue";
import PageTransition from "./components/PageTransition.vue";
import ToastContainer from "./components/ui/ToastContainer.vue";
import { isDebugMode } from "@/services/unified.service";

const showSplash = ref(true);
const isInitialized = ref(false);

onMounted(() => {
	showSplash.value = true;
});

function handleSplashDone() {
	showSplash.value = false;
	isInitialized.value = true;
}
</script>

<template>
	<div>
		<SplashScreen v-if="showSplash" @done="handleSplashDone" />
		<ToastContainer />
		<PageTransition v-if="isInitialized || !showSplash">
			<router-view />
		</PageTransition>

		<div
			v-if="isDebugMode"
			class="fixed bottom-4 right-4 z-50 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg"
		>
			DEBUG MODE
		</div>
	</div>
</template>
