import {Options, Vue} from 'vue-class-component';
import axios from 'axios';
import router from '@/router/index';

@Options({})
export default class ManageEshopItems extends Vue {
    private eshopItems: any = [];
    private pageNo: number = 0;
    private nextPageAllowed = false;
    private currencies: any = [];
    private selectedAll = false;
    private withInactive = false;

    public selectAll(): void {
        this.selectedAll = !this.selectedAll;
        this.eshopItems.forEach((eshopItem: any) => {
            eshopItem.selected = this.selectedAll;
        });
    }

    public selectId(Id: number): void {
        this.eshopItems[Id].selected = !this.eshopItems[Id].selected;
    }

    public setWithInactive(): void {
        this.withInactive = !this.withInactive;
        this.otherPage(0);
    }

    public getCurrencyByCountry(Country: string) {
        return this.currencies.find((currency: any) => currency.country.indexOf(Country) > -1);
    }

    public showEshopItem(Id: number): void {
        this.$store.state.selectedEshopItem = {id:Id};
        router.replace('/eshopItemEdit');
    }

    public eshopItemAdd(): void {
        this.$store.state.selectedEshopItem = { id: null };
        router.replace('/eshopItemEdit');
    }

    public async mounted(): Promise<void> {
        this.$store.state.selectedEshopItem = { id: null };
        this.currencies = this.$store.getters['ui/currencies'];

        await axios.post(this.$store.state.apiUrls.getAdminEshopItems, {
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            session: this.$store.state.auth.token, pageNo: this.pageNo, onlyDefaultAttachment: 1, withInactive: Number(!this.withInactive), id: null
        }).then((data: any) => {
            if (data.data.result == 1 && data.data.eshopItems != []) {
                data.data.eshopItems.forEach((eshopItem: any) => {
                    eshopItem.selected = false;
                    this.eshopItems.push(JSON.parse(JSON.stringify(eshopItem)));
                });
                if (data.data.eshopItems.length >= 10) { this.nextPageAllowed = true; } else { this.nextPageAllowed = false; }
            }
        }).catch((error) => {
            console.log('dataerror', error);
        });
    }

    public async deleteEshopItem(): Promise<void> {
        const deleteEshopItemsIds: any[] = [];
        this.eshopItems.forEach((eshopItem: any, index: number, thisArray: any) => {
            if (eshopItem.selected) { deleteEshopItemsIds.push(eshopItem.id); }
        });

        axios.post(this.$store.state.apiUrls.deleteEshopItems, {
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            session: this.$store.state.auth.token, ids: deleteEshopItemsIds
        }).then((data: any) => {
            if (data.data.result == 1) {
                this.otherPage(0);
            }
        }).catch((error) => {
            console.log('dataerror', error);
        });
       
    }

    public async otherPage(direction: number): Promise<void>  {
        this.pageNo += direction; this.eshopItems = []; //this.selectedAll = false;
        await axios.post(this.$store.state.apiUrls.getAdminEshopItems, {
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            session: this.$store.state.auth.token, pageNo: this.pageNo, onlyDefaultAttachment: 1, withInactive: Number(!this.withInactive), id: null
        }).then((data: any) => {
            if (data.data.result == 1 && data.data.eshopItems != []) {
                data.data.eshopItems.forEach((eshopItem: any) => {
                    eshopItem.selected = false;
                    this.eshopItems.push(JSON.parse(JSON.stringify(eshopItem)));
                });
                if (data.data.eshopItems.length >= 10) { this.nextPageAllowed = true; } else { this.nextPageAllowed = false;}
            }
        }).catch((error) => {
            console.log('dataerror', error);
        });
    }
}
