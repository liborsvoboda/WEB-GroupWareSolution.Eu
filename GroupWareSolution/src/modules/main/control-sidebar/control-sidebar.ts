import {Options, Vue} from 'vue-class-component';
import Checkbox from '@/components/checkbox/checkbox.vue';
import Select from '@/components/select/select.vue';
import {Option} from '@/components/select/select';
import {
    CANVAS_BALL_VARIANTS,
    NAVBAR_DARK_VARIANTS,
    SIDEBAR_SKINS,
} from '@/utils/themes';

import { IUser } from '@/interfaces/user';
import { useToast } from 'vue-toastification';
import axios from 'axios';

import en from '@/translation/en.json';
import cz from '@/translation/cz.json';

@Options({
    name: 'app-control-sidebar',
    components: {
        'app-checkbox': Checkbox,
        'app-select': Select
    }
})
export default class ControlSidebar extends Vue {
    private navbarDarkVariants: Array<Option> = NAVBAR_DARK_VARIANTS;
    private SidebarSkins: Array<Option> = SIDEBAR_SKINS;
    private canvasBallVariants: Array<Option> = CANVAS_BALL_VARIANTS;
    private toast = useToast();
    private userConfiguration: any = {};

    public handleDarkModeChange() {
        this.$store.dispatch('ui/toggleDarkMode');
        if (this.user != null) {
            this.saveUserConfiguration();
        }
    }

    private onNavbarVariantChange(event: any) {
        this.$store.dispatch('ui/setNavbarVariant', event.target.value);
        if (this.user != null) {
            this.saveUserConfiguration();
        }
    }

    private onSidebarSkinChange(event: any) {
        this.$store.dispatch('ui/setSidebarSkin', event.target.value);
        if (this.user != null) {
            this.saveUserConfiguration();
        }
    }

    private canvasBallVariantChange(event: any) {
        this.$store.dispatch('ui/setCanvasBallVariant', event.target.value);
        if (this.user != null) {
            this.saveUserConfiguration();
        }
    }

    get darkModeSelected() {
        return this.$store.getters['ui/darkModeSelected'];
    }

    get navbarVariant() {
        return this.$store.getters['ui/navbarVariant'];
    }

    get canvasBallVariant() {
        return this.$store.getters['ui/CanvasBallVariant'];
    }

    get sidebarSkin() {
        return this.$store.getters['ui/sidebarSkin'];
    }

    get user(): IUser {
        return this.$store.getters['auth/user'];
    }

    async saveUserConfiguration(): Promise<void> {
        try {
            this.userConfiguration = [
                { name: 'darkMode', value: this.$store.getters['ui/darkModeSelected'] },
                { name: 'navbarVariant', value: this.$store.getters['ui/navbarVariant'] },
                { name: 'sidebarSkin', value: this.$store.getters['ui/sidebarSkin'] }
            ];

            await axios.post(this.$store.state.apiUrls.setUserConfiguration,
                {
                    dataType: "json",
                    contentType: 'application/json; charset=utf-8',
                    session: this.$store.state.auth.token, config: JSON.stringify(this.userConfiguration)
                }).then((data: any) => {
                    if (data.data.result == 1) {
                        //this.toast.success(this.$i18n.locale == "cz" ? cz.messages.messageSended : en.messages.messageSended);
                    }
                }).catch((error) => {
                    console.log('dataerror', error);
                    this.toast.error(error.message);
                });
        } catch (error: any) {
            console.log(error);
            this.toast.error(error.message);
        }
    }
    
}
