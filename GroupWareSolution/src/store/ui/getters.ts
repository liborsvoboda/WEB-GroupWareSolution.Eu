export default {
    darkModeSelected: (state: any): boolean => state.darkMode,
    menuSidebarCollapsed: (state: any): boolean => state.menuSidebarCollapsed,
    controlSidebarCollapsed: (state: any): boolean => state.controlSidebarCollapsed,
    screenSize: (state: any): boolean => state.screenSize,
    navbarVariant: (state: any): string => state.navbarVariant,
    sidebarSkin: (state: any): string => state.sidebarSkin,
    Language: (state: any): string => state.Language,
    knowledgeLanguages: (state: any): string => state.knowledgeLanguages,
    currencies: (state: any): string => state.currencies,
    vats: (state: any): string => state.vats,
    configuration: (state: any): string => state.configuration,
    CanvasBallVariant: (state: any): string => state.CanvasBallVariant,
    basket: (state: any): string => state.basket,
    deliveryTypes: (state: any): string => state.deliveryTypes,
    paymentTypes: (state: any): string => state.paymentTypes
};
