/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import {Options, Vue} from 'vue-class-component';
import Header from './header/header.vue';
import MenuSidebar from './menu-sidebar/menu-sidebar.vue';
import ControlSidebar from './control-sidebar/control-sidebar.vue';
import Footer from './footer/footer.vue';
import axios from 'axios';


@Options({
    components: {
        'app-header': Header,
        'menu-sidebar': MenuSidebar,
        'control-sidebar': ControlSidebar,
        'app-footer': Footer
    },
    watch: {
        watchLayoutChanges: (_) => {}
    }
})
export default class Main extends Vue {
    private appElement: HTMLElement | null = null;
    private calendarAgendas: any[] = [];

    public async mounted(): Promise<void> {
        this.appElement = document.getElementById('app') as HTMLElement;
        this.appElement.classList.add('sidebar-mini');
        this.appElement.classList.add('layout-fixed');
        try {
            if (this.$store.getters['auth/token'] != null) {
                await axios.post(this.$store.state.apiUrls.authStatus,{
                        dataType: "json",
                        contentType: 'application/json; charset=utf-8',
                        session: this.$store.getters['auth/token']
                }).then((data: any) => {
                    if (data.data.result == 1) {
                        this.$store.dispatch('auth/getUser', data.data.user);

                        if (data.data.user != null) {

                            if (this.$store.state.menu.filter((item: any) => { if (item.name == 'labels.calendarAgendas') return item; }).length == 0) {

                                axios.post(this.$store.state.apiUrls.getCalendarAgendas, {
                                    dataType: "json",
                                    contentType: 'application/json; charset=utf-8',
                                    session: this.$store.getters['auth/token']
                                }).then((data: any) => {
                                    if (data.data.result == 1) {
                                        this.calendarAgendas = [];
                                        data.data.agendas.forEach((agenda: any, index: number, count: any[]) => {
                                            agenda.path = '/calendar?selected=' + agenda.name;
                                            this.calendarAgendas.push({ name: agenda.name, path: agenda.path });

                                            if (index == count.length - 1) {
                                                //this.$store.state.menu.splice(2, 0, { name: 'labels.calendarAgendas', children: JSON.parse(JSON.stringify(this.calendarAgendas)) });
                                                this.$store.state.menu.push({ name: 'labels.calendarAgendas', children: this.calendarAgendas });
                                            }
                                        });
                                    }
                                });
                            }

                            if (this.$store.state.menu.filter((item: any) => { if (item.name == 'labels.mailBox') return item; }).length == 0) {
                                this.$store.state.menu.push({ name: 'labels.mailBox', children: [{ name: 'labels.inbox', path: '/inbox' }, { name: 'labels.sent', path: '/sent' }] });
                            }

                            switch (data.data.user.configuration.name) {
                                case 'darkMode':
                                    this.$store.state.ui.toggleDarkMode = data.data.user.configuration.value;
                                    break;
                                case 'canvasBallVariant':
                                    this.$store.dispatch('ui/setCanvasBallVariant', data.data.user.configuration.value);
                                    break;
                                case 'navbarVariant':
                                    this.$store.dispatch('ui/setNavbarVariant', data.data.user.configuration.value);
                                    break;
                                case 'sidebarSkin':
                                    this.$store.dispatch('ui/setSidebarSkin', data.data.user.configuration.value);
                                    break;
                                default:
                            }

                            if (data.data.user.isAdmin) {
                                if (this.$store.state.menu.filter((item: any) => { if (item.name == 'labels.adminTools') return item; }).length == 0) {
                                    this.$store.state.menu.push({
                                        name: 'labels.adminTools', children: [
                                            { name: 'labels.contentEditor', path: '/contenteditor' },
                                            { name: 'labels.manageEshopItems', path: '/manageEshopItems' }
                                        ]
                                    });
                                }
                            }
                        }
                    
                    } else {
                        //this.$store.dispatch('auth/logout');
                    }
                }).catch((error) => {
                    console.log('dataerror', error);
                });
            } else {
                //this.$store.dispatch('auth/logout');
            }
        } catch (error) {
            this.$store.dispatch('auth/logout');
        }
    }

    public unmounted(): void {
        this.appElement.classList.remove('sidebar-mini');
        this.appElement.classList.remove('layout-fixed');
    }

    get watchLayoutChanges() {
        if (!this.appElement) {
            return;
        }
        this.appElement.classList.remove('dark-mode');
        this.appElement.classList.remove('sidebar-closed');
        this.appElement.classList.remove('sidebar-collapse');
        this.appElement.classList.remove('sidebar-open');
        this.appElement.classList.remove('control-sidebar-slide-open');

        if (this.darkModeSelected) {
            this.appElement.classList.add('dark-mode');
        }

        if (!this.controlSidebarCollapsed) {
            this.appElement.classList.add('control-sidebar-slide-open');
        }

        if (this.menuSidebarCollapsed && this.screenSize === 'lg') {
            this.appElement.classList.add('sidebar-collapse');
        } else if (this.menuSidebarCollapsed && this.screenSize === 'xs') {
            this.appElement.classList.add('sidebar-open');
        } else if (!this.menuSidebarCollapsed && this.screenSize !== 'lg') {
            this.appElement.classList.add('sidebar-closed');
            this.appElement.classList.add('sidebar-collapse');
        }
        return this.appElement.classList.value;
    }

    get darkModeSelected() {
        return this.$store.getters['ui/darkModeSelected'];
    }

    get menuSidebarCollapsed() {
        return this.$store.getters['ui/menuSidebarCollapsed'];
    }

    get controlSidebarCollapsed() {
        return this.$store.getters['ui/controlSidebarCollapsed'];
    }

    get screenSize() {
        return this.$store.getters['ui/screenSize'];
    }
}
