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
	faChevronDown
);

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.component("font-awesome-icon", FontAwesomeIcon);
app.mount("#app");
