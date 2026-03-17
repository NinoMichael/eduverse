import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

/* import font awesome icon component */
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

/* import specific icons */
import { faUser } from '@fortawesome/free-solid-svg-icons';

library.add(faUser);

const app = createApp(App);

app.use(router);
app.component('font-awesome-icon', FontAwesomeIcon);
app.mount('#app');
