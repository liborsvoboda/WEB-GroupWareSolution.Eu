import { Options, Vue } from 'vue-class-component';
import Select from '@/components/select/select.vue';
import Checkbox from '@/components/checkbox/checkbox.vue';
import useVuelidate from "@vuelidate/core";
import { required, email, minLength, sameAs } from "@vuelidate/validators";
import axios from 'axios';
import { IUser } from '@/interfaces/user';
import router from '../../router';
import { Watch } from 'vue-property-decorator';
import html2Pdf from 'html-pdf'
import { useToast } from 'vue-toastification';
import summernote from 'summernote';

import en from '@/translation/en.json';
import cz from '@/translation/cz.json';
import { useValidation } from 'vue3-form-validation';
import { Option } from '@/components/select/select';

@Options({
    components: {
        'app-checkbox': Checkbox,
        'app-select': Select,
        'summernote': summernote
    },
    validations: {
        inputName: { required, minLength: minLength(1) },
        inputEmail: { required, email },
        inputPhone: { required, minLength: minLength(9) },
        inputStreet: { required, minLength: minLength(1) },
        inputCity: { required, minLength: minLength(1) },
        inputPostCode: { required, minLength: minLength(5) },
        inputPaymentType: { required, minLength: minLength(5) },
        inputDeliveryType: { required, minLength: minLength(5) },
    }
})
export default class Basket extends Vue {
    public inputUser: any = [];
    private eshopItems: any = [];
    private selectedAll = false;
    private orderStep: number = 1;
    public isLoading: boolean = true;
    public paymentTypeList: Array<Option> = [];
    public deliveryTypeList: Array<Option> = [];
    private variableSymbol: string = '';

    private inputCompanyName: string = '';
    private inputName: string = '';
    private inputStreet: string = '';
    private inputCity: string = '';
    private inputPostCode: string = '';
    private inputEmail: string = '';
    private inputPhone: string = '';
    private inputPaymentType: string = '';
    private inputDeliveryType: string = '';
    private inputNote: string = '';

    private otherDeliveryAddress: boolean = false;
    private inputDeliveryCompanyName: string = '';
    private inputDeliveryName: string = '';
    private inputDeliveryStreet: string = '';
    private inputDeliveryCity: string = '';
    private inputDeliveryPostCode: string = '';
    private inputDeliveryEmail: string = '';
    private inputDeliveryPhone: string = '';

    private toast = useToast();
    v$: any = useVuelidate();


    public async mounted(): Promise<void> {
        this.inputUser = JSON.parse(JSON.stringify(this.$store.getters['auth/user']));
        if (this.inputUser != null) {
            this.inputName = this.inputDeliveryName = this.inputUser.name + " " + this.inputUser.surname;
            this.inputStreet = this.inputDeliveryStreet = this.inputUser.street;
            this.inputCity = this.inputDeliveryCity = this.inputUser.city;
            this.inputCompanyName = this.inputDeliveryCompanyName = this.inputUser.companyName;
            this.inputPostCode = this.inputDeliveryPostCode = this.inputUser.postcode;
            this.inputEmail = this.inputDeliveryEmail = this.inputUser.email;
            this.inputPhone = this.inputDeliveryPhone = this.inputUser.phone;
        }

        

        this.$store.getters['ui/basket'].forEach((item: any) => {
            if (item != ['']) {
                item.selected = false;
                this.eshopItems.push(JSON.parse(JSON.stringify(item)));
            }
        });

        await axios.get(this.$store.state.apiUrls.getVariableSymbol)
            .then((data) => {
                if (data.data.result == 1) {
                    this.variableSymbol = data.data.variableSymbol;
                }
            }).catch((error) => {
                console.log('dataerror', error);
            });

        this.paymentTypeList = this.getPaymentTypesByCountry();
        this.deliveryTypeList = this.getDeliveryTypesByCountry();
        this.isLoading = false;
    }

    setOrderStep(stepId: number) {
        if (this.orderStep == 2) {
            this.inputNote = $("#summerNote").summernote('code');
        }

        this.orderStep = stepId;

        if (this.orderStep == 2) {
            $(document).ready(() => {
                $('#summerNote').summernote({ height: 150 });
            });
        }

        if (this.orderStep == 4) {
            this.sendOrder();
        }
    }

    get user(): IUser {
        return this.$store.getters['auth/user'];
    }

    get totalPrice(): any {
        let totalPrice = 0;
        this.$store.getters['ui/basket'].forEach((item: any) => {
            if (item != ['']) {
                totalPrice += item.amount * item.price * (1 / this.getCurrencyByCountry(this.$store.getters['ui/Language']).value);
            }
        });
        return totalPrice;
    }

    get totalPriceWithVat(): any {
        let totalPrice = 0;
        this.$store.getters['ui/basket'].forEach((item: any) => {
            if (item != ['']) {
                totalPrice += item.amount * (item.price * (1 / this.getCurrencyByCountry(this.$store.getters['ui/Language']).value) * (1 + this.getVatById(item.vatId).value));
            }
        });
        return totalPrice;
    }

    public getCurrencyByCountry(Country: string): any {
        return this.$store.getters['ui/currencies'].find((currency: any) => currency.country.indexOf(Country) > -1);
    }

    public getVatById(Vat: number) {
        return this.$store.getters['ui/vats'].find((vat: any) => vat.id == Vat);
    }

    public getPaymentTypesByCountry() {
        this.$store.getters['ui/paymentTypes'].forEach((item: any) => {
            if (item != ['']) {
                this.paymentTypeList.push({ value: item[this.$store.getters['ui/Language']], label: item[this.$store.getters['ui/Language']]});
            }
        });
        return this.paymentTypeList;
    }

    public async paymentTypeSelect(event: any): Promise<void> {
        this.inputPaymentType = event.target.value;
        this.validations();
    };

    public getDeliveryTypesByCountry() {
        this.$store.getters['ui/deliveryTypes'].forEach((item: any) => {
            if (item != ['']) {
                this.deliveryTypeList.push({ value: item[this.$store.getters['ui/Language']], label: item[this.$store.getters['ui/Language']] });
            }
        });
        return this.deliveryTypeList;
    }

    public async deliveryTypeSelect(event: any): Promise<void> {
        this.inputDeliveryType = event.target.value;
        this.validations();
    };

    public selectId(Id: number) {
        this.eshopItems.forEach((eshopItem: any, index: number) => {
            if (Id == index) { eshopItem.selected = !eshopItem.selected; }
        });
    }

    public selectAll(): void {
        this.selectedAll = !this.selectedAll;
        this.eshopItems.forEach((eshopItem: any) => {
            eshopItem.selected = this.selectedAll;
        });
    }

    public async deleteEshopItem(): Promise<void> {
        const basketItems: any[] = [];
        this.eshopItems.forEach((eshopItem: any) => {
            if (!eshopItem.selected) { basketItems.push(eshopItem); }
        });
        if (basketItems.length == 0) { this.setOrderStep(1); }
        this.$store.state.ui.basket = this.eshopItems = basketItems;
    }

    public async RemoveBasket(index: number): Promise<void> {
        const items = this.$store.getters['ui/basket'];
        items.splice(index, 1);
        if (items.length == 0) { this.setOrderStep(1); }
        this.$store.state.ui.basket = this.eshopItems = items;
    }

    public showEshopItem(item: any): void {
        this.$store.state.selectedEshopItem = item;
        router.replace('/eshopItemDetail');
    }

    get invalid(): boolean {
        return this.v$.$invalid;
    }

    validations() {
        return {
            inputName: { required, minLength: minLength(1) },
            inputStreet: { required, minLength: minLength(1) },
            inputCity: { required, minLength: minLength(1) },
            inputPostCode: { required, minLength: minLength(5) },
            inputEmail: { required, email },
            inputPhone: { required, minLength: minLength(9) },
            inputPaymentType: { required, minLength: minLength(5) },
            inputDeliveryType: { required, minLength: minLength(5) }
        }
    }

    public print() {
        window.print();
    }

    //load payment method and delivery method


    public async sendOrder() {
        const printOrderArea = document.getElementById("printOrderArea").innerHTML.toString();
        const printPriceArea = document.getElementById("printPriceArea").innerHTML.toString();
        const printItemArea = document.getElementById("printItemArea").innerHTML.toString();
       //send order
      try {
          await axios.post(this.$store.state.apiUrls.setEshopOrder,
                {
                    dataType: "json",
                    contentType: 'application/json; charset=utf-8',
                    session: this.$store.state.auth.token, variableSymbol: this.variableSymbol,
                    companyName: this.inputCompanyName, name: this.inputName, street: this.inputStreet, city: this.inputCity, postCode: this.inputPostCode,
                    email: this.inputEmail, phone: this.inputPhone, otherDeliveryAddress: this.otherDeliveryAddress, deliveryCompanyName: this.inputDeliveryCompanyName, 
                    deliveryName: this.inputDeliveryName, deliveryStreet: this.inputDeliveryStreet, deliveryCity: this.inputDeliveryCity, deliveryPostCode: this.inputDeliveryPostCode,
                    deliveryEmail: this.inputDeliveryEmail, deliveryPhone: this.inputDeliveryPhone, paymentType: this.inputPaymentType, deliveryType: this.inputDeliveryType,
                    totalPrice: this.totalPrice, totalVatPrice: this.totalPriceWithVat, description: this.inputNote, language: this.$store.getters['ui/Language'],
                    printOrderArea: printOrderArea, printPriceArea: printPriceArea, printItemArea: printItemArea, items: JSON.stringify(this.eshopItems)
                    // step 3 body? orderHtmlContent

                }).then((data: any) => {
                    if (data.data.result == 1) {
                        this.toast.success(this.$i18n.locale == "cz" ? cz.messages.eshopOrdersent : en.messages.eshopOrdersent);
                    } else {
                        this.toast.error(data.data.message);
                    }
                }).catch((error) => {
                    console.log('dataerror', error);
                    this.toast.error(error.message);
                });
        } catch (error: any) {
            console.log(error);
            this.toast.error(error.message);
        }

        this.$store.state.ui.basket = ['']
    }

    printDownload() {
        //const test = document.getElementById("printArea") as HTMLDivElement;
        //const worker = html2Pdf.create(test.innerHTML.toString(), {
        //    format: 'A4'
        //}).toFile('./order.pdf', (err: Error, res: html2Pdf.FileInfo) => {
        //    if (err) return console.log(err);
        //    console.log(res);
        //});

        //const w = window.open()
        //w.document.write(document.getElementById("printArea").innerHTML)
        //w.document.close()
    }
}
