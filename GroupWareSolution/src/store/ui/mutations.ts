import {
    CANVAS_BALL_VARIANTS,
    NAVBAR_DARK_VARIANTS,
    SIDEBAR_SKINS,
} from '@/utils/themes';

export default {
    toggleDarkMode: (state: any): void => {
        state.darkMode = !state.darkMode;
        if (state.darkMode) {
            state.navbarVariant = NAVBAR_DARK_VARIANTS[4].value;
            state.sidebarSkin = SIDEBAR_SKINS[0].value;
        } else {
            state.navbarVariant = NAVBAR_DARK_VARIANTS[0].value;
            state.sidebarSkin = SIDEBAR_SKINS[0].value;
        }
    },
    toggleMenuSidebar: (state: any): void => {
        state.menuSidebarCollapsed = !state.menuSidebarCollapsed;
    },
    toggleControlSidebar: (state: any): void => {
        state.controlSidebarCollapsed = !state.controlSidebarCollapsed;
    },
    setWindowSize: (state: any, payload: string): void => {
        state.screenSize = payload;
    },
    setNavbarVariant: (state: any, payload: string): void => {
        if (state.darkMode) {
            state.navbarVariant = payload || NAVBAR_DARK_VARIANTS[4].value;
        } else {
            state.navbarVariant = payload || NAVBAR_DARK_VARIANTS[0].value;
        }
    },
    setSidebarSkin: (state: any, payload: string): void => {
        if (state.darkMode) {
            state.sidebarSkin = payload || SIDEBAR_SKINS[0].value;
        } else {
            state.sidebarSkin = payload || SIDEBAR_SKINS[0].value;
        }
    },
    setLanguage: (state: any, payload: string): void => {
        state.Language = payload;
    },
    setCanvasBallVariant: (state: any, payload: string): void => {
        state.CanvasBallVariant = payload || CANVAS_BALL_VARIANTS[0].value;
    }
};
