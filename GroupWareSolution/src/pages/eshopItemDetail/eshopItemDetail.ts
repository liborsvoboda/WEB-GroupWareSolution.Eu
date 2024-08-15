import { Options, Vue } from 'vue-class-component';
import Select from '@/components/select/select.vue';
import { Option } from '@/components/select/select';
import Checkbox from '@/components/checkbox/checkbox.vue';
import useVuelidate from "@vuelidate/core";
import { required, email, minLength, sameAs, numeric, minValue, maxLength } from "@vuelidate/validators";
import { IUser } from '@/interfaces/user';
import { useToast } from 'vue-toastification';
import axios from 'axios';
import summernote from 'summernote';

import en from '@/translation/en.json';
import cz from '@/translation/cz.json';
import { useValidation } from 'vue3-form-validation';

@Options({
    validations: {
        inputNameCZ: { required },
        inputNameEN: { required },
        priceType: { required, minLength: minLength(5) },
        inputCount: { required, minValue: minValue(1), minLength: minLength(1), maxLength: maxLength(3) }
    },
    components: {
        'app-checkbox': Checkbox,
        'app-select': Select,
        'summernote': summernote
    }
})
export default class EshopItemDetail extends Vue {
    private filesArray: Array<any> = [];
    private selectedEshopItemId: number = null;
    public isLoading: boolean = true;

    public priceType: string = null;
    public priceTypeList: Array<Option> = [{ value: "VALUE", label: "VALUE" }, { value: "CALCULATE", label: "CALCULATE", }, { value: "AGREED", label: "AGREED" }];
    public currency: string = null;
    public currencyList: Array<Option> = [];
    public defaultFileExists: boolean = false;
    public inputActive: boolean = true;
    public inputId: number = null;
    public inputNameCZ: string = '';
    public inputNameEN: string = '';
    public inputPrice: string = null;
    public inputBlankUrl: string = '';
    public shortContentCZ: string = null;
    public shortContentEN: string = null;
    public contentCZ: string = null;
    public contentEN: string = null;
    private toast = useToast();
    v$: any = useVuelidate();
    private currencies: any = [];
    private vats: any = [];
    private vatId: number = null;
    private comments: any = [];
    private atributsColor: any = [];
    private atributsSize: any = [];
    private inputCount: number = 1;
    private basket: any = [];
    public inputNote: string = null;

    public async mounted(): Promise<void> {
        this.selectedEshopItemId = this.$store.state.selectedEshopItem.id;
        this.currencies = this.$store.getters['ui/currencies'];
        this.vats = this.$store.getters['ui/vats'];
        this.basket = this.$store.getters['ui/basket'];

        //$(document).ready(() => {
        //    $('#summerNote').summernote({ height: 150});
        //});

        if (this.$store.state.selectedEshopItem.amount != undefined) {
            this.inputCount = this.$store.state.selectedEshopItem.amount;
            //$('#summerNote').summernote('code', this.$store.state.selectedEshopItem.note);
            //$('#summerNote').summernote({ height: 150 });
        }

        this.$store.getters['ui/currencies'].forEach((menuItem: any) => {
            this.currencyList.push({ value: menuItem, label: menuItem });
        });

        await axios.post(this.$store.state.apiUrls.getEshopItems, {
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            pageNo: 0, onlyDefaultAttachment: 0, withInactive: 0, id: this.selectedEshopItemId
        }).then((data: any) => {
            if (data.data.result == 1 && data.data.eshopItems != []) {
                data.data.eshopItems.forEach((eshopItem: any) => {
                    this.defaultFileExists = eshopItem.attachmentExist;
                    this.inputId = eshopItem.id;
                    this.inputActive = eshopItem.enabled;
                    this.inputNameCZ = eshopItem.name_cz;
                    this.inputNameEN = eshopItem.name_en;
                    this.inputPrice = eshopItem.price;
                    this.inputBlankUrl = eshopItem.blankUrl;
                    this.shortContentCZ = eshopItem.shortDescription_cz;
                    this.shortContentEN = eshopItem.shortDescription_en;
                    this.contentCZ = eshopItem.description_cz;
                    this.contentEN = eshopItem.description_en;
                    this.priceType = eshopItem.priceType;
                    this.vatId = eshopItem.vatId;
                    eshopItem.attachments.forEach((attachment: any, index: number) => {
                        this.filesArray.push({ id: index, fileName: attachment.fileName, size: attachment.size, mimeType: attachment.mimeType, content: attachment.content, source: "eshop", default: attachment.default });
                    })

                    eshopItem.comments.forEach((comment: any, index: number) => {
                        this.comments.push({ id: index, comment: comment.comment, ratting: comment.ratting, timestamp: comment.timestamp });
                    });

                    eshopItem.atributs.forEach((atribut: any, index: number) => {
                        if (atribut.type == "COLOR") {
                            this.atributsColor.push({ id: index, type: atribut.type, sequence: atribut.sequence, name: atribut.name, value: atribut.value, timestamp: atribut.timestamp });
                        } else {
                            this.atributsSize.push({ id: index, type: atribut.type, sequence: atribut.sequence, name: atribut.name, value: atribut.value, timestamp: atribut.timestamp });
                        }
                    });

                    this.atributsColor.sort(function (a: any, b: any) {
                        return a.sequence.localeCompare(b.sequence);
                    });

                    this.atributsSize.sort(function (a: any, b: any) {
                        return a.sequence.localeCompare(b.sequence);
                    });
                });
            }
            this.isLoading = false;
        }).catch((error) => {
            console.log('dataerror', error);
            this.isLoading = false;
        });
    }

    get user(): IUser {
        return this.$store.getters['auth/user'];
    }

    public getCurrencyByCountry(Country: string) {
        return this.currencies.find((currency: any) => currency.country.indexOf(Country) > -1);
    }

    public getVatById(Vat: number) {
        return this.vats.find((vat: any) => vat.id == Vat);
    }

    getStar(ratting: number) {
        if (ratting == 1) {
            return "star.png";
        } else if (ratting <= 1 && ratting >= 0.5) {
            return "halfStar.png";
        } else {
            return "Star.png";
        }
    }

    showImage(Id: number) {
        this.filesArray.forEach((file, index) => {
            if (Id == index) {
                const previewImage = document.getElementById('previewImage') as HTMLImageElement;
                previewImage.src = file.content;
            }
        });
    }

    getDefaultImage() {
        return this.filesArray.find((file: any) => file.default);
    }

    downloadFile(Id: number) {
        const linkSource = this.filesArray[Id].content;
        const downloadLink = document.createElement("a");
        const fileName = this.filesArray[Id].fileName;

        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
    }

    validations() {
        this.checkCount();
        return {
            inputNameCZ: { required, minLength: minLength(1) },
            inputNameEN: { required, minLength: minLength(1) },
            priceType: { required, minLength: minLength(5) },
            inputCount: { required, minLength: minLength(1), minValue: minValue(1), maxLength: maxLength(3) }
        }
    }

    checkCount() {
        this.inputCount = this.inputCount < 1 ? 1 : this.inputCount > 999 ? 999 : this.inputCount;
    }

    public async addToBasket(): Promise<void> {
        this.basket = this.$store.getters['ui/basket'];
        if (this.basket[0] == ['']) { this.basket.splice(0, 1); }
    
        if (this.$store.state.selectedEshopItem.amount != undefined) {
            this.basket.splice(this.$store.state.selectedEshopItem.index, 1);
        }

        this.basket.push({ id: this.inputId, name_cz: this.inputNameCZ, name_en: this.inputNameEN, amount: this.inputCount, price: this.inputPrice, vatId: this.vatId, image: this.getDefaultImage(), priceType: this.priceType, selected: false });
        this.$store.state.ui.basket = this.basket;
    }

    get basketItems() {
        this.basket = [];
        this.$store.getters['ui/basket'].forEach((item: any) => {
            if (item != ['']) {
                this.basket.push(JSON.parse(JSON.stringify(item)));
            }
        });
        return this.basket;
    }
}