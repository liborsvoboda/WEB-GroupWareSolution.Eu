import {IUser} from '@/interfaces/user';
import {Options, Vue } from 'vue-class-component';
import MenuItem from '@/components/menu-item/menu-item.vue';
import TagsBall from '/node_modules/vue-tags-ball/src/TagsBall.vue';
import axios from 'axios';
import { Watch } from 'vue-property-decorator';

@Options({
    name: 'app-menu-sidebar',
    components: {
        'app-menu-item': MenuItem,
        'tags-ball': TagsBall
    }
})
export default class MenuSidebar extends Vue {
    private PaymentTypes: any[] = [];
    private DeliveryTypes: any[] = [];
    private KnowledgeLanguages: any[] = [];
    private Configuration: any[] = [];
    private Currencies: any[] = [];
    private Vats: any[] = [];
    private menu: any[] = null;

    get user(): IUser {
        return this.$store.getters['auth/user'];
    }

    get sidebarSkin() {
        return this.$store.getters['ui/sidebarSkin'];
    }

    public async mounted(): Promise<void> {
        this.menu = this.$store.state.menu;

        await axios.get(this.$store.state.apiUrls.getConfiguration)
            .then((data) => {
                if (data.data.result == 1) {
                    data.data.configurations.forEach((configuration: any) => {

                        switch (configuration.name) {
                            case 'darkMode':
                                this.$store.state.ui.toggleDarkMode = configuration.value;
                                break;
                            case 'canvasBallVariant':
                                this.$store.dispatch('ui/setCanvasBallVariant', configuration.value);
                                break;
                            case 'navbarVariant':
                                this.$store.dispatch('ui/setNavbarVariant', configuration.value);
                                break;
                            case 'sidebarSkin':
                                this.$store.dispatch('ui/setSidebarSkin', configuration.value);
                                break;
                            default:
                        }

                        this.Configuration.push(configuration);

                    });
                }
                this.$store.state.ui.configuration = this.Configuration;
            }).catch((error) => {
                console.log('dataerror', error);
            });

        await axios.get(this.$store.state.apiUrls.getActualCurrency)
            .then((data) => {
                if (data.data.result == 1) {
                    data.data.currencies.forEach((currency: any) => {
                        this.Currencies.push(currency);
                    });
                }
                this.$store.state.ui.currencies = this.Currencies;
            }).catch((error) => {
                console.log('dataerror', error);
            });

        await axios.get(this.$store.state.apiUrls.getVats)
            .then((data) => {
                if (data.data.result == 1) {
                    data.data.vats.forEach((vats: any) => {
                        this.Vats.push(vats);
                    });
                }
                this.$store.state.ui.vats = this.Vats;
            }).catch((error) => {
                console.log('dataerror', error);
            });

        await axios.get(this.$store.state.apiUrls.knowledgeLanguages)
            .then((data) => {
                if (data.data.result == 1) {
                    data.data.knowledgeLanguages.forEach((languages: any) => {
                        this.KnowledgeLanguages.push(languages.language);
                    });
                }
                this.$store.state.ui.knowledgeLanguages = this.KnowledgeLanguages;
            }).catch((error) => {
                console.log('dataerror', error);
            });

        await axios.get(this.$store.state.apiUrls.getDeliveryTypes)
            .then((data) => {
                if (data.data.result == 1) {
                    data.data.deliveryTypes.forEach((delivery: any) => {
                        this.DeliveryTypes.push(delivery);
                    });
                }
                this.$store.state.ui.deliveryTypes = this.DeliveryTypes;
            }).catch((error) => {
                console.log('dataerror', error);
            });

        await axios.get(this.$store.state.apiUrls.getPaymentTypes)
            .then((data) => {
                if (data.data.result == 1) {
                    data.data.paymentTypes.forEach((payment: any) => {
                        this.PaymentTypes.push(payment);
                    });
                }
                this.$store.state.ui.paymentTypes = this.PaymentTypes;
            }).catch((error) => {
                console.log('dataerror', error);
            });
    }

    get knowledgeLanguages() {
        return this.$store.getters['ui/knowledgeLanguages'];
    }

    get earthItemsColor() {
        return this.$store.getters['ui/CanvasBallVariant'];
    }

    @Watch('earthItemsColor')
    onPropertyChanged(value: string, oldValue: string) {
        console.log();
    }
}

