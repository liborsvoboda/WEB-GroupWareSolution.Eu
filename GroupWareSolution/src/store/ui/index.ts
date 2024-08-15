import mutations from './mutations';
import actions from './actions';
import getters from './getters';
import {calculateWindowSize} from '@/utils/helpers';

const uiModule = {
    namespaced: true,
    state: {
        darkMode: false,
        navbarVariant: 'navbar-dark',
        sidebarSkin: 'sidebar-dark-primary',
        menuSidebarCollapsed: false,
        controlSidebarCollapsed: true,
        screenSize: calculateWindowSize(window.innerWidth),
        Language: 'cz',
        knowledgeLanguages: [''],
        currencies: [''],
        vats: [''],
        configuration: [''],
        CanvasBallVariant: '#22ccff',
        basket: [''],
        deliveryTypes: [''],
        paymentTypes: ['']
    },
    mutations,
    actions,
    getters
};

export default uiModule;

