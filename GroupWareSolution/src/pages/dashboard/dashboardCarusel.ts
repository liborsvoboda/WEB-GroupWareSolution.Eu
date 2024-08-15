import {Options, Vue} from 'vue-class-component';
import router from '../../router';
import axios from 'axios';

import en from '@/translation/en.json';
import cz from '@/translation/cz.json';

@Options({})
export default class Dashboard extends Vue {
    public contentCz: string = null;
    public contentEn: string = null;
    public isLoading: boolean = true;
    public menuList: Array<any> = [];
    public carouselCycle: any = 0;
    private menuIndex = 0;

    public async mounted(): Promise<void> {
        await axios.post(this.$store.state.apiUrls.getMenuList, {
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            session: this.$store.state.auth.token
        }).then((data: any) => {
            if (data.data.result == 1) {
                data.data.menuList.forEach((menuItem: any) => {
                    this.menuList.push(menuItem.name);
                });
                axios.post(this.$store.state.apiUrls.getMenuContent, {
                    dataType: "json",
                    contentType: 'application/json; charset=utf-8',
                    name: this.menuList[this.menuIndex]
                }).then((data: any) => {
                    if (data.data.result == 1) {
                        this.$store.state.selectedMail.subject = this.menuList[this.menuIndex];
                        this.contentCz = data.data.menu.cz;
                        this.contentEn = data.data.menu.en;
                    }
                }).catch((error) => {
                    console.log('dataerror', error);
                    
                }).finally(() => {
                    this.isLoading = false;
                });
                
                this.carousel();
            }
        }).catch((error) => {
            console.log('dataerror', error);
        });
    }

    public async carousel(): Promise<void> {
        this.carouselCycle = setInterval(() => {
            if (router.currentRoute.value.path != "/") { clearInterval(this.carouselCycle); } else {
                this.isLoading = true;
                this.menuIndex = (this.menuList.length - 1 > this.menuIndex) ? this.menuIndex + 1 : 0;
                axios.post(this.$store.state.apiUrls.getMenuContent, {
                    dataType: "json",
                    contentType: 'application/json; charset=utf-8',
                    name: this.menuList[this.menuIndex]
                }).then((data: any) => {
                    if (data.data.result == 1) {
                        this.$store.state.selectedMail.subject = this.menuList[this.menuIndex];
                        this.contentCz = data.data.menu.cz;
                        this.contentEn = data.data.menu.en;
                    }
                }).catch((error) => {
                    console.log('dataerror', error);

                }).finally(() => {
                    this.isLoading = false;
                });
            }
        }, 60000);
        
    }

    question() {
        this.$store.state.selectedMail.content = null;
        router.replace('contactus');
    }

}