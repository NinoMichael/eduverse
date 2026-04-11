<script setup lang="ts">
import { ref, onMounted } from "vue";
import "./index.css";
import SplashScreen from "./components/SplashScreen.vue";
import PageTransition from "./components/PageTransition.vue";
import ToastContainer from "./components/ui/ToastContainer.vue";

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
	</div>
</template>
