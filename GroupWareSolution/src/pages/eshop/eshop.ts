import {Options, Vue} from 'vue-class-component';
import axios from 'axios';
import router from '@/router/index';

@Options({})
export default class Eshop extends Vue {
    private eshopItems: any = [];
    private comments: any = [];
    private pageNo: number = 0;
    private nextPageAllowed = false;
    private currencies: any = [];
    private withInactive = false;
    private vats: any = [];
    public isLoading: boolean = true;

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
        this.$store.state.selectedEshopItem = { id: Id };
        router.replace('/eshopItemDetail');
    }

    public getVatById(Vat: number) {
        return this.vats.find((vat: any) => vat.id == Vat);
    }

    public async mounted(): Promise<void> {
        this.$store.state.selectedEshopItem = { id: null };
        this.currencies = this.$store.getters['ui/currencies'];
        this.vats = this.$store.getters['ui/vats'];

        await axios.post(this.$store.state.apiUrls.getEshopItems, {
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            pageNo: this.pageNo, onlyDefaultAttachment: 1, withInactive: Number(!this.withInactive)
        }).then((data: any) => {
            if (data.data.result == 1 && data.data.eshopItems != []) {
                if (data.data.eshopItems != []) {
                    data.data.eshopItems.forEach((eshopItem: any) => {
                        eshopItem.selected = false;

                        let totalRatting = 0;
                        eshopItem.comments.forEach((comment: any, index: number) => {
                            totalRatting += comment.ratting;
                            this.comments.push({ id: index, comment: comment.comment, ratting: comment.ratting, timestamp: comment.timestamp });
                        }); eshopItem.totalRatting = totalRatting / eshopItem.comments.length;

                        this.eshopItems.push(JSON.parse(JSON.stringify(eshopItem)));
                    });
                    if (data.data.eshopItems.length >= 10) { this.nextPageAllowed = true; } else { this.nextPageAllowed = false; }
                }
            }
            this.isLoading = false;
        }).catch((error) => {
            console.log('dataerror', error);
            this.isLoading = false;
        });
    }

    public async otherPage(direction: number): Promise<void>  {
        this.pageNo += direction; this.eshopItems = [];
        await axios.post(this.$store.state.apiUrls.getEshopItems, {
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            pageNo: this.pageNo, onlyDefaultAttachment: 1, withInactive: Number(!this.withInactive)
        }).then((data: any) => {
            if (data.data.result == 1 && data.data.eshopItems != []) {
                if (data.data.eshopItems != []) {
                    data.data.eshopItems.forEach((eshopItem: any) => {
                        eshopItem.selected = false;
                        this.eshopItems.push(JSON.parse(JSON.stringify(eshopItem)));
                    });
                    if (data.data.eshopItems.length >= 10) { this.nextPageAllowed = true; } else { this.nextPageAllowed = false;}
                }
            }
        }).catch((error) => {
            console.log('dataerror', error);
        });
    }
}
