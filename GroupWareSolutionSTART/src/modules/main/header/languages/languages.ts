import {Options, Vue} from 'vue-class-component';
import Dropdown from '@/components/dropdown/dropdown.vue';

import en from '@/translation/en.json';
import cz from '@/translation/cz.json';

@Options({
    name: 'languages-dropdown',
    components: {
        'app-dropdown': Dropdown
    }
})
export default class Languages extends Vue {
    public selectedLanguage: string = null;
    public languages: any = [
        {
            key: 'cz',
            flag: 'flag-icon-cz',
            label: 'languages.czech'
        },
        {
            key: 'en',
            flag: 'flag-icon-us',
            label: 'languages.english'
        }
    ];

    public mounted() {
        this.selectedLanguage = this.$i18n.locale;
    }

    get flagIcon() {
        this.$store.state.ui.Language = this.selectedLanguage;
        if (this.selectedLanguage === 'cz') {
            document.title = cz.labels.companyName;
            return 'flag-icon-cz';
        }
        if (this.selectedLanguage === 'de') {
            return 'flag-icon-de';
        }
        if (this.selectedLanguage === 'es') {
            return 'flag-icon-es';
        }
        document.title = en.labels.companyName;
        return 'flag-icon-us';
    }

    public changeLanguage(langCode: string) {
        if (this.$i18n.locale !== langCode) {
            this.$i18n.locale = langCode;
            this.selectedLanguage = langCode;
        }
    }
}
