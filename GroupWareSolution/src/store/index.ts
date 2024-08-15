import {createStore} from 'vuex';
import authModule from './auth';
import uiModule from './ui';

import {
    SOCKET_ONOPEN,
    SOCKET_ONCLOSE,
    SOCKET_ONERROR,
    SOCKET_ONMESSAGE,
    SOCKET_RECONNECT,
    SOCKET_RECONNECT_ERROR
} from "./mutation-types"
import { Vue } from 'vue-class-component';
import App from '../app/app';

export default createStore({
    state: {
        menu: [
            { name: 'labels.dashboard', path: '/' },
            { name: 'labels.photogallery', path: '/photogallery' },
            { name: 'labels.productsDevelopment', path: '/productsdevelopment' },
            { name: 'labels.documentation', path: '/documentation' },
            { name: 'labels.easydatacenter', path: '/easydatacenter' },
            { name: 'labels.easybuilder', path: '/easybuilder' },
            { name: 'labels.eshop', path: '/eshop' },
            {
                name: 'labels.whatWeDo',
                children: [
                    { name: 'labels.serversShort', path: '/servers' },
                    { name: 'labels.multiplatformShort', path: '/multiplatform' },
                    { name: 'labels.desktopApplications', path: '/desktopapplications' },
                    { name: 'labels.webApplications', path: '/webapplications' },
                    { name: 'labels.controlingBi', path: '/controlingbi' },
                    { name: 'labels.graphicsApp', path: '/graphicsapp' },
                    { name: 'labels.ApiImplementation', path: '/apiimplementation' },
                    { name: 'labels.dataBridges', path: '/databridges' },
                    { name: 'labels.remoteSupport', path: '/remotesupport' },
                    { name: 'labels.customAppWeb', path: '/customappweb' },
                    { name: 'labels.openSolutions', path: '/opensolutions' },
                    { name: 'labels.backuping', path: '/backuping' },
                    { name: 'labels.plcFactory4', path: '/plc&factory4' },
                    { name: 'labels.specificHw', path: '/specifichw' },
                ]
            },
            { name: 'labels.pricelist', path: '/pricelist' },
            { name: 'labels.awards', path: '/awards' },
            { name: 'labels.references', path: '/references' },
            { name: 'labels.contactUs', path: '/contactus' }
        ],
        selectedMail: { id: null, direction: null, sendTo: null, subject: null, content: null },
        selectedEshopItem: { id: null },
        apiUrls: {
            authStatus: "https://groupware-solution.eu:444/authStatus",
            login: "https://groupware-solution.eu:444/login",
            register: "https://groupware-solution.eu:444/signUp",
            resetPassword: "https://groupware-solution.eu:444/resetPassword",
            getResetPassword: "https://groupware-solution.eu:444/getResetPassword",
            recoverPassword: "https://groupware-solution.eu:444/recoverPassword",
            sendEmail: "https://groupware-solution.eu:444/sendEmail",
            knowledgeLanguages: "https://groupware-solution.eu:444/getKnowledgeLanguages",
            readEmail: "https://groupware-solution.eu:444/readEmail",
            getEmails: "https://groupware-solution.eu:444/getEmails",
            deleteEmails: "https://groupware-solution.eu:444/deleteEmails",
            updateProfile: "https://groupware-solution.eu:444/updateProfile",
            getMenuList: "https://groupware-solution.eu:444/getMenuList",
            getMenuContent: "https://groupware-solution.eu:444/getMenuContent",
            setMenuContent: "https://groupware-solution.eu:444/setMenuContent",
            eshopItemAdd: "https://groupware-solution.eu:444/eshopItemAdd",
            getEshopItems: "https://groupware-solution.eu:444/getEshopItems",
            getAdminEshopItems: "https://groupware-solution.eu:444/getAdminEshopItems",
            deleteEshopItems: "https://groupware-solution.eu:444/deleteEshopItems",
            getCurrencies: "https://groupware-solution.eu:444/getCurrencies",
            getActualCurrency: "https://groupware-solution.eu:444/getActualCurrency",
            getVats: "https://groupware-solution.eu:444/getVats",
            writeVisit: "https://groupware-solution.eu:444/writeVisit",
            getConfiguration: "https://groupware-solution.eu:444/getConfiguration",
            setUserConfiguration: "https://groupware-solution.eu:444/setUserConfiguration",
            getCalendarAgendas: "https://groupware-solution.eu:444/getCalendarAgendas",
            setNewCalendar: "https://groupware-solution.eu:444/setNewCalendar",
            deleteCalendar: "https://groupware-solution.eu:444/deleteCalendar",
            updateCalendar: "https://groupware-solution.eu:444/updateCalendar",
            getDeliveryTypes: "https://groupware-solution.eu:444/getDeliveryTypes",
            getPaymentTypes: "https://groupware-solution.eu:444/getPaymentTypes",
            getVariableSymbol: "https://groupware-solution.eu:444/getVariableSymbol",
            setEshopOrder: "https://groupware-solution.eu:444/setEshopOrder"
        },
        socket: {
            isConnected: false,
            messageChat: '',
            messageEmail: '',
            message: '',
            reconnectError: false,
            heartBeatTimer: 0,
            heartBeatInterval: 5000,
        }
    },
    mutations: {
        [SOCKET_ONOPEN](state, event) {
            state.socket.isConnected = true
        },
        [SOCKET_ONCLOSE](state, event) {
            state.socket.isConnected = false
        },
        [SOCKET_ONERROR](state, event) {
            console.error(state, event)
        },
        [SOCKET_ONMESSAGE](state, message) {
            if (message.code == "getChatOk") { state.socket.messageChat = message; }
            else if (message.code == "getEmailOk") { state.socket.messageEmail = message; }
            else { state.socket.message = message; }
            //state.socket.message = message
        },
        [SOCKET_RECONNECT](state, count) {
            //console.info(state, count)
        },
        [SOCKET_RECONNECT_ERROR](state) {
            state.socket.reconnectError = true;
        },
        SOCKET_ONOPEN(state, event) {
            App.prototype.$.appContext.app.config.globalProperties.$socket = event.currentTarget;
            state.socket.isConnected = true;
        },
        SOCKET_ONCLOSE(state, event) {
            state.socket.isConnected = false;
            clearInterval(state.socket.heartBeatTimer);
            state.socket.heartBeatTimer = 0;
            console.log("The line is disconnected: " + new Date());
            console.log(event);
        },
        SOCKET_ONERROR(state, event) {
            console.error(state, event);
        },
        SOCKET_ONMESSAGE(state, message) {
            state.socket.message = message;
        },
        SOCKET_RECONNECT(state, count) {
            //console.info("console info", state, count);
        },
        SOCKET_RECONNECT_ERROR(state) {
            state.socket.reconnectError = true;
        }
    },
    modules: {
        auth: authModule,
        ui: uiModule
    }
});
