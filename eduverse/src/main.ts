import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";

/* import font awesome icon component */
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

/* import specific icons */
import {
	faUser,
	faGraduationCap,
	faSchool,
	faLocationDot,
	faBookOpen,
	faInfoCircle,
	faRocket,
	faRobot,
	faLock,
	faSpinner,
	faTimes,
	faCheckCircle,
	faExclamationCircle,
	faExclamationTriangle,
	faChevronDown,
	faKey,
	faArrowRight,
	faBars,
	faChevronLeft,
	faChevronRight,
	faSignOutAlt,
	faBell,
	faUserGraduate,
	faChalkboardTeacher,
	faDoorOpen,
	faClipboardCheck,
	faChartLine,
	faCalendarAlt,
	faCog,
	faHome,
	faDownload,
	faArrowUp,
	faArrowDown,
	faUserPlus,
	faUserCircle,
	faInbox,
	faClock,
	faTimesCircle,
	faTriangleCircleSquare,
	faCalendarWeek,
	faUsers,
	faHouse,
	faPlusCircle,
	faEllipsisV,
	faCalendarCheck,
} from "@fortawesome/free-solid-svg-icons";

library.add(
	faUser,
	faGraduationCap,
	faSchool,
	faLocationDot,
	faBookOpen,
	faInfoCircle,
	faRocket,
	faRobot,
	faLock,
	faSpinner,
	faTimes,
	faCheckCircle,
	faExclamationCircle,
	faExclamationTriangle,
	faChevronDown,
	faChevronLeft,
	faChevronRight,
	faKey,
	faArrowRight,
	faArrowUp,
	faArrowDown,
	faBars,
	faSignOutAlt,
	faBell,
	faUserGraduate,
	faChalkboardTeacher,
	faDoorOpen,
	faClipboardCheck,
	faChartLine,
	faCalendarAlt,
	faCog,
	faHome,
	faDownload,
	faUserPlus,
	faUserCircle,
	faInbox,
	faClock,
	faTimesCircle,
	faTriangleCircleSquare,
	faCalendarWeek,
	faUsers,
	faClock,
	faHouse,
	faPlusCircle,
	faEllipsisV,
	faCalendarCheck
);

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.component("font-awesome-icon", FontAwesomeIcon);
app.mount("#app");
