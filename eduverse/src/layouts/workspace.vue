<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import Sidebar from "@/components/layout/Sidebar.vue";
import TopBar from "@/components/layout/TopBar.vue";
import { useLayout } from "@/composables/useLayout";

const { sidebarState, updateLayout } = useLayout();

onMounted(() => {
	updateLayout();
	window.addEventListener("resize", updateLayout);
});

onUnmounted(() => {
	window.removeEventListener("resize", updateLayout);
});
</script>

<template>
	<div class="min-h-screen bg-background flex">
		<Sidebar />
		<div
			class="flex-1 flex flex-col min-h-screen transition-all duration-300"
			:style="{ marginLeft: sidebarState.marginLeft + 'px' }"
		>
			<TopBar />
			<div class="p-6">
				<router-view />
			</div>
		</div>
	</div>
</template>
