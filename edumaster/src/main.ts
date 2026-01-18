import { createApp } from "vue";
import App from "./App.vue";

/* import font awesome icon component */
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

/* import specific icons */
import { faUser } from '@fortawesome/free-solid-svg-icons';

library.add(faUser);

createApp(App)
  .component('font-awesome-icon', FontAwesomeIcon)
  .mount('#app');
