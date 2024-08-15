import {Options, Vue} from 'vue-class-component';
import router from '../../router';
import axios from 'axios';

import en from '@/translation/en.json';
import cz from '@/translation/cz.json';

@Options({})
export default class GraphicsApp extends Vue {
    public contentCz: string = null;
    public contentEn: string = null;
    public isLoading: boolean = true;

    public async mounted(): Promise<void> {
        await axios.post(this.$store.state.apiUrls.getMenuContent, {
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            name: 'graphicsapp'
        }).then((data: any) => {
            if (data.data.result == 1) {
                this.contentCz = data.data.menu.cz;
                this.contentEn = data.data.menu.en;
            }
        }).catch((error) => {
            console.log('dataerror', error);
        });
        this.isLoading = false;
    }

    question() {
        this.$store.state.selectedMail.subject = (this.$i18n.locale == "cz") ? cz.labels.graphicsApp : en.labels.graphicsApp;
        this.$store.state.selectedMail.content = null;
        router.replace('contactus');
    }

}