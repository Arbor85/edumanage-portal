

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import '../index.css';
import { initAuth0 } from './auth/auth0';

const app = createApp(App);
app.use(router);

initAuth0({
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  client_id: import.meta.env.VITE_AUTH0_CLIENT_ID,
  redirect_uri: window.location.origin + '/callback',
  audience: import.meta.env.VITE_AUTH0_AUDIENCE,
  scope: 'openid profile email',
}).then(() => {
  app.mount('#app');
});
