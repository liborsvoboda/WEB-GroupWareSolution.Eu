import {createApp} from 'vue';
import App from './app/app.vue';
import router from './router';
import store from './store';
import {
    SOCKET_ONOPEN,
    SOCKET_ONCLOSE,
    SOCKET_ONERROR,
    SOCKET_ONMESSAGE,
    SOCKET_RECONNECT,
    SOCKET_RECONNECT_ERROR
} from './store/mutation-types'

const mutations = {
    SOCKET_ONOPEN,
    SOCKET_ONCLOSE,
    SOCKET_ONERROR,
    SOCKET_ONMESSAGE,
    SOCKET_RECONNECT,
    SOCKET_RECONNECT_ERROR
}

import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faLock, faEnvelope} from '@fortawesome/free-solid-svg-icons';
import {faFacebook, faGooglePlus} from '@fortawesome/free-brands-svg-icons';
import Toast, {PluginOptions} from 'vue-toastification';
import { createI18n } from 'vue-i18n';
import { VueWindowSizePlugin } from 'vue-window-size/option-api';
import Vuelidate from '@vuelidate/core';
import VueGapi from 'vue-gapi';

import { VueReCaptcha } from 'vue-recaptcha-v3';
import VueNativeSock from "vue-native-websocket-vue3";
import { QuillEditor } from '@vueup/vue-quill';

import { createVuetify } from 'vuetify';

import '@vueup/vue-quill/dist/vue-quill.snow.css';
import '@vueup/vue-quill/dist/vue-quill.bubble.css';

import en from './translation/en.json';
import cz from './translation/cz.json';
import './index.scss';

library.add(faLock, faEnvelope, faFacebook, faGooglePlus);

const options: PluginOptions = {
    timeout: 5000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: 'button',
    icon: true,
    rtl: false
};

const i18n = createI18n({
    locale: 'cz',
    messages: {en, cz},
    fallbackLocale: 'cz'
});

const vuetify = createVuetify({
    locale: {
        defaultLocale: i18n.global.locale,
        fallbackLocale: 'cz',
        messages: { en, cz }
    }
});

createApp(App)
    .component('font-awesome-icon', FontAwesomeIcon)
    .component('QuillEditor', QuillEditor)
    .use(vuetify)
    .use(store)
    .use(router)
    .use(VueWindowSizePlugin)
    .use(Toast, options)
    .use(i18n)
    .use(Vuelidate)
    .use(VueNativeSock, 'wss://groupware-solution.eu:3000', {
        store: store,
        mutations: mutations,
        format: 'json',
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000, 
    })
    .use(VueReCaptcha, {
        siteKey: '6Lel4uIdAAAAADiYGEkn82jnMT-rlbIuP5G_c8wJ',
        loaderOptions: {
            useRecaptchaNet: true
        }
    })
    .use(VueGapi, {
        apiKey: 'AIzaSyA1v0lsh11XyCYZ4oGNOOk4W6F_XMO10MM',
        clientId: '349939057340-d4316lkvcs29k777d45oc1rac1gna1qf.apps.googleusercontent.com',
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
        scope: 'https://www.googleapis.com/auth/userinfo.profile',
    })
    .mount('#app');
