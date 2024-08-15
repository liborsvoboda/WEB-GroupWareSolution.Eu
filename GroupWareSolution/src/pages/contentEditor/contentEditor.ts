import { Options, Vue } from 'vue-class-component';
import Select from '@/components/select/select.vue';
import { Option } from '@/components/select/select';
import router from '../../router';
import axios from 'axios';
import summernote from 'summernote';
import { useToast } from 'vue-toastification';

import en from '@/translation/en.json';
import cz from '@/translation/cz.json';

@Options({
    components: {
        'app-select': Select,
        'summernote': summernote
    }
})
export default class ContentEditor extends Vue {
    public selectedMenu: string = null;
    public menuList: Array<Option> = [];
    public contentCZ: string = null;
    public contentEN: string = null;
    public saveEnabled: boolean = false;
    private toast = useToast();
    
    public async mounted(): Promise<void> {
        $(document).ready(function () {
            $('#summernoteCz').summernote();
            $('#summernoteEn').summernote();
        });

        await axios.post(this.$store.state.apiUrls.getMenuList, {
            dataType: "json",
            contentType: 'application/json; charset=utf-8'
        }).then((data: any) => {
            if (data.data.result == 1) {
                data.data.menuList.forEach((menuItem: any) => {
                    this.menuList.push({ value: menuItem.name, label: menuItem.name });
                });
            }
        }).catch((error) => {
            console.log('dataerror', error);
        });
    }

    public async loadMenu(event: any): Promise<void> {
        this.selectedMenu = event.target.value;
        this.saveEnabled = (this.selectedMenu == "None") ? false : true;

        if (this.saveEnabled) {
            await axios.post(this.$store.state.apiUrls.getMenuContent, {
                dataType: "json",
                contentType: 'application/json; charset=utf-8',
                name: event.target.value
            }).then((data: any) => {
                if (data.data.result == 1) {
                    $('#summernoteCz').summernote('code', data.data.menu.cz);
                    $('#summernoteEn').summernote('code', data.data.menu.en);
                }
            }).catch((error) => {
                console.log('dataerror', error);
            });
        } else {
            $('#summernoteCz').summernote('reset');
            $('#summernoteEn').summernote('reset');
        }
    }

    public async save(): Promise<void> {
        await axios.post(this.$store.state.apiUrls.setMenuContent, {
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            session: this.$store.state.auth.token, name: this.selectedMenu, cz: $("#summernoteCz").summernote('code'), en: $("#summernoteEn").summernote('code')
        }).then((data: any) => {
            if (data.data.result == 1) {
                this.toast.success(this.$i18n.locale == "cz" ? cz.labels.menuSaved : en.labels.menuSaved);
            } else {
                this.toast.error(data.data.message);
            }
        }).catch((error) => {
            console.log('dataerror', error);
        });
    }

}