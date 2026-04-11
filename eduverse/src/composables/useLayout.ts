import { reactive } from "vue";

const sidebarState = reactive({
	width: 256,
	marginLeft: 256,
	isCollapsed: false,
	isMobile: false,
});

function updateLayout() {
	const width = window.innerWidth;

	if (width < 1024) {
		sidebarState.isMobile = true;
		sidebarState.width = 0;
		sidebarState.marginLeft = 0;
		sidebarState.isCollapsed = false;
	} else if (width < 1280) {
		sidebarState.isMobile = false;
		sidebarState.isCollapsed = true;
		sidebarState.width = 80;
		sidebarState.marginLeft = 80;
	} else {
		sidebarState.isMobile = false;
		sidebarState.isCollapsed = false;
		sidebarState.width = 256;
		sidebarState.marginLeft = 256;
	}
}

function toggleSidebar() {
	if (sidebarState.isCollapsed) {
		sidebarState.isCollapsed = false;
		sidebarState.width = 256;
		sidebarState.marginLeft = 256;
	} else {
		sidebarState.isCollapsed = true;
		sidebarState.width = 80;
		sidebarState.marginLeft = 80;
	}
}

export function useLayout() {
	return {
		sidebarState,
		updateLayout,
		toggleSidebar,
	};
}
