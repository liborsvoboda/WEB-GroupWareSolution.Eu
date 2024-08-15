import { Options, Vue } from 'vue-class-component';
import Select from '@/components/select/select.vue';
import { Option } from '@/components/select/select';
import Checkbox from '@/components/checkbox/checkbox.vue';
import useVuelidate from "@vuelidate/core";
import { required, email, minLength, sameAs, numeric } from "@vuelidate/validators";
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
        vat: {numeric}
    },
    components: {
        'app-checkbox': Checkbox,
        'app-select': Select,
        'summernote': summernote
    }
})
export default class EshopItemEdit extends Vue {
    private filesArray: Array<any> = [];
    private selectedEshopItemId: number = null;

    public priceType: string = null;
    public priceTypeList: Array<Option> = [{ value: "VALUE", label: "VALUE" }, { value: "CALCULATE", label: "CALCULATE", }, { value: "AGREED", label: "AGREED"}];
    public vat: string = null;
    public vatList: Array<Option> = [];
    public defaultFileExists: boolean = false;
    public inputActive: boolean = true;
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

    public async mounted(): Promise<void> {
        this.selectedEshopItemId = this.$store.state.selectedEshopItem.id;

        $(document).ready( () => {
            $('#summernoteShortCz').summernote();
            $('#summernoteShortEn').summernote();
            $('#summernoteCz').summernote();
            $('#summernoteEn').summernote();
        });

        this.$store.getters['ui/vats'].forEach((vat: any) => {
            this.vatList.push({ value: vat.id, label: vat.name });
        });
        if (this.$store.state.selectedEshopItem.id != null) {
            await axios.post(this.$store.state.apiUrls.getAdminEshopItems, {
                dataType: "json",
                contentType: 'application/json; charset=utf-8',
                session: this.$store.state.auth.token, pageNo: 0, onlyDefaultAttachment: 0, withInactive: 0, id: this.selectedEshopItemId
            }).then((data: any) => {
                if (data.data.result == 1 && data.data.eshopItems != []) {
                    data.data.eshopItems.forEach((eshopItem: any) => {
                        this.defaultFileExists = eshopItem.attachmentExist;
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
                        this.vat = eshopItem.vatId;
                        eshopItem.attachments.forEach((attachment: any) => {
                            this.filesArray.push({ fileName: attachment.fileName, size: attachment.size, mimeType: attachment.mimeType, content: attachment.content, source: "eshop", default: attachment.default });
                        })


                        $('#summernoteShortCz').summernote('code', this.shortContentCZ);
                        $('#summernoteShortEn').summernote('code', this.shortContentEN);
                        $('#summernoteCz').summernote('code', this.contentCZ);
                        $('#summernoteEn').summernote('code', this.contentEN);
                    });
                }
            }).catch((error) => {
                console.log('dataerror', error);
            });
        }
    }

    get user(): IUser {
        return this.$store.getters['auth/user'];
    }

    setDefaultFile(Id: number) {
        this.filesArray.forEach((file, index) => {
            if (Id == index) { file.default = 1; this.defaultFileExists = true; } else { file.default = 0; }
        });
    }

    checkDefaultFile() {
        let res = false;
        this.filesArray.forEach((file, index) => {
            if (file.default == 1) { res = true; }
        });
        if (!res && this.filesArray.length > 0) {
            this.filesArray.forEach((file, index) => {
                if (['png', 'jpeg', 'jpg'].some(el => file.mimeType.includes(el)) && !res) { res = true; this.filesArray[0].default = 1; }
            });
        }

        const priceSettedOk = ((this.priceType == 'CALCULATE' || this.priceType == 'AGREED')) ? true : (this.priceType == 'VALUE') ? (this.inputPrice != null) ? (parseFloat(this.inputPrice)) ? true : false : false : false;
        const vatSettedOk = (this.vat.toLowerCase() != 'none' && this.vat != null) ? true : false;
        this.defaultFileExists = (res && priceSettedOk && vatSettedOk) ? true : false;
        return this.defaultFileExists;
    }

    deleteFile(Id: number) {
        this.filesArray.splice(Id, 1);
        this.checkDefaultFile();
    }

    downloadFile(Id: number) {
        const linkSource = this.filesArray[Id].content;
        const downloadLink = document.createElement("a");
        const fileName = this.filesArray[Id].fileName;

        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
    }

    loadTextFromFile(ev: { target: { files: any[]; }; }) {
        const file = ev.target.files[0];
        const reader = new FileReader();

        reader.onload = e => this.$emit("load", e.target.result);
        reader.readAsDataURL(file);
        //reader.readAsArrayBuffer(file);

        reader.onloadend = (evt) => {
            if (evt.target.readyState === FileReader.DONE) {
                const fileByteArray = reader.result.toString(); //btoa(reader.result.toString());
                const byteArray = new Blob([reader.result.toString()], { type: file.type });
                //byteArray.arrayBuffer().then(arrayBuffer =>
                //    new Uint8Array(arrayBuffer).forEach(char => { fileByteArray.push(char); }));
                this.filesArray.push({ fileName: file.name, size: file.size, mimeType: (file.type != "") ? file.type : "text/plain", content: fileByteArray, source: "eshop", default: 0 });
                if (this.filesArray.length == 1) { this.checkDefaultFile(); }
            }
        }
    }

    public async priceTypeSelect(event: any): Promise<void> {
        this.priceType = event.target.value;
        this.validations();
    };

    public async vatSelect(event: any): Promise<void> {
        this.vat = event.target.value;
        this.validations();
    };

    validations() {
        this.checkDefaultFile();
        return {
            inputNameCZ: { required, minLength: minLength(1) },
            inputNameEN: { required, minLength: minLength(1) },
            priceType: { required, minLength: minLength(5) },
            vat: { numeric }
        }
    }

    async saveEshopItem(): Promise<void> {
        try {
            await axios.post(this.$store.state.apiUrls.eshopItemAdd,
                {
                    dataType: "json",
                    contentType: 'application/json; charset=utf-8',
                    session: this.$store.state.auth.token, id: this.selectedEshopItemId, name_cz: this.inputNameCZ, name_en: this.inputNameEN,
                    shortDescription_cz: $("#summernoteShortCz").summernote('code'), shortDescription_en: $("#summernoteShortEn").summernote('code'),
                    description_cz: $("#summernoteCz").summernote('code'), description_en: $("#summernoteEn").summernote('code'),
                    blankUrl: this.inputBlankUrl, priceType: this.priceType, price: this.inputPrice, enabled: this.inputActive, attachments: this.filesArray,
                    vatId: this.vat
                }).then((data: any) => {
                    if (data.data.result == 1) {
                        this.toast.success(this.$i18n.locale == "cz" ? cz.messages.eshopItemSaved : en.messages.eshopItemSaved);
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
    }
}