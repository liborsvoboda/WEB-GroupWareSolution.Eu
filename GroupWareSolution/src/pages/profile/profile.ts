import {Options, Vue} from 'vue-class-component';
import { IUser } from '@/interfaces/user';
import { useToast } from 'vue-toastification';
import axios from 'axios';
import router from '../../router';
import useVuelidate from "@vuelidate/core";
import { required, email, minLength, sameAs } from "@vuelidate/validators";
import store from '../../store';

import en from '@/translation/en.json';
import cz from '@/translation/cz.json';

@Options({})
export default class Profile extends Vue {
    public inputUser: any = [];
    private filesArray: Array<any> = [];
    private toast = useToast();

    get user(): IUser {
        return this.$store.getters['auth/user'];
    }

    public async mounted(): Promise<void> {
        this.inputUser = JSON.parse(JSON.stringify(this.$store.getters['auth/user']));
    }

    loadTextFromFile(ev: { target: { files: any[]; }; }) {
        const file = ev.target.files[0];
        const reader = new FileReader();

        reader.onload = e => this.$emit("load", e.target.result);
        reader.readAsDataURL(file);
        //reader.readAsArrayBuffer(file);

        reader.onloadend = (evt) => {
            if (evt.target.readyState === FileReader.DONE) {
                const fileByteArray = reader.result.toString(); 
                this.inputUser.picture = fileByteArray;
            }
        }

    }

    public async updateProfile(): Promise<void> {
        try {
            await axios.post(this.$store.state.apiUrls.updateProfile,
                {
                    dataType: "json",
                    contentType: 'application/json; charset=utf-8',
                    session: this.$store.state.auth.token,
                    companyName: this.inputUser.companyName, name: this.inputUser.name, surname: this.inputUser.surname, street: this.inputUser.street, city: this.inputUser.city, postcode: this.inputUser.postcode,
                    agreeTerms: this.inputUser.agreeTerms, phone: this.inputUser.phone, picture: this.inputUser.picture, route: router.currentRoute.value.fullPath
                }).then((data: any) => {
                    if (data.data.result == 1) {
                        this.toast.success(this.$i18n.locale == "cz" ? cz.labels.profileSaved : en.labels.profileSaved);
                        axios.post(this.$store.state.apiUrls.authStatus, {
                            dataType: "json",
                            contentType: 'application/json; charset=utf-8',
                            session: this.$store.getters['auth/token']
                        }).then((data: any) => {
                            if (data.data.result == 1) {
                                this.$store.dispatch('auth/getUser', data.data.user);
                            } else {
                                //this.$store.dispatch('auth/logout');
                            }
                        }).catch((error) => {
                            console.log('dataerror', error);
                        });
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
