import {Options, Vue} from 'vue-class-component';
import Dropdown from '@/components/dropdown/dropdown.vue';
import { IUser } from '@/interfaces/user';
import { Watch } from 'vue-property-decorator';
import router from '@/router/index';

import en from '@/translation/en.json';
import cz from '@/translation/cz.json';

@Options({
    name: 'basketMenu',
    components: {
        'app-dropdown': Dropdown
    }
})
export default class BasketMenu extends Vue {
    public basket: any[] = [];
    public basketCount: number = 0;
    public basketPrice: number = 0;

    public async mounted(): Promise<void> {
        this.$store.getters['ui/basket'].forEach((item: any) => {
            if (item != ['']) {
                this.basketCount += 1;
                this.basketPrice += item.amount * (item.price * (1 / this.getCurrencyByCountry(this.$store.getters['ui/Language']).value) * (1 + this.getVatById(item.vatId).value));
                this.basket.push(JSON.parse(JSON.stringify(item)));
            }
        });
    }

    public getVatById(Vat: number) {
        return this.$store.getters['ui/vats'].find((vat: any) => vat.id == Vat);
    }

    public getCurrencyByCountry(Country: string): any {
        return this.$store.getters['ui/currencies'].find((currency: any) => currency.country.indexOf(Country) > -1);
    }

    get user(): IUser {
        return this.$store.getters['auth/user'];
    }

    get basketItems() {
        this.basketCount = 0; this.basketPrice = 0; this.basket = [];
        this.$store.getters['ui/basket'].forEach((item: any) => {
            if (item != ['']) {
                this.basketCount += 1;
                this.basketPrice += item.amount * (item.price * (1 / this.getCurrencyByCountry(this.$store.getters['ui/Language']).value) * (1 + this.getVatById(item.vatId).value));
                this.basket.push(JSON.parse(JSON.stringify(item)));
            }
        });
        return this.basket;
    }

    @Watch('basketItems')
    onPropertyChanged(value: string, oldValue: string) {
        //console.log("basketItemsCount",this.basketItems);
    }

    public async RemoveBasket(index: number): Promise<void> {
        this.basket = this.$store.getters['ui/basket'];
        this.basket.splice(index, 1);
        this.$store.state.ui.basket = this.basket;
    }

    public showEshopItem(Id: number, Amount: number, Index: number, Note: string): void {
        this.$store.state.selectedEshopItem = { id: Id, amount: Amount, index: Index, note: Note };
        router.push('/eshopItemDetail');
    }

    gotoBasket() {
        router.push('/basket');
    }
}
