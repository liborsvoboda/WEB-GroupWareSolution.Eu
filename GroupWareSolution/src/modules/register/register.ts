import {Options, Vue} from 'vue-class-component';
import Checkbox from '@/components/checkbox/checkbox.vue';
import Input from '@/components/input/input.vue';
import Button from '@/components/button/button.vue';
import {useToast} from 'vue-toastification';
import useVuelidate from "@vuelidate/core";
import { required, email, minLength, sameAs, between } from "@vuelidate/validators";
import axios from 'axios';
import router from '../../router';

import en from '@/translation/en.json';
import cz from '@/translation/cz.json';

@Options({
    components: {
        'app-checkbox': Checkbox,
        'app-input': Input,
        'app-button': Button
    },
    validations: {
        email: { required, email },
        password: { required, minLength: minLength(8) },
        rePassword: { required, sameAs: (password: string, rePassword: any) => { return password == rePassword.password } },
        agreeTerms: { between: between(1,1) }
    }
})
export default class Register extends Vue {
    private appElement: HTMLElement | null = null;
    public email: string = '';
    public password: string = '';
    public rePassword: string = '';
    public agreeTerms: boolean = false;
    public isAuthLoading: boolean = false;
    public isFacebookLoading: boolean = false;
    public isGoogleLoading: boolean = false;
    private toast = useToast();
    v$: any = useVuelidate();

    validations() {
        return {
            email: { required, email },
            password: { required, minLength },
            rePassword: { sameAs: sameAs(this.password, this.rePassword)},
            agreeTerms: { required }
        }
    }

    public mounted(): void {
        this.appElement = document.getElementById('app') as HTMLElement;
        this.appElement.classList.add('register-page');
    }

    public unmounted(): void {
        (this.appElement as HTMLElement).classList.remove('register-page');
    }

    async registerByAuth(authType: string): Promise<void> {
        grecaptcha.ready(() => {
            grecaptcha.execute('6Lel4uIdAAAAADiYGEkn82jnMT-rlbIuP5G_c8wJ', { action: 'homepage' }).then((token: any) => {
                if (authType == 'auth') { this.registerByAuthRequest(token); }
                //else if (authType == 'facebook') { this.registerByFacebookRequest(token); }
                //else if (authType == 'google') { this.registerByGoogleRequest(token); }
            });
        });
    }

    public async registerByAuthRequest(recaptcha: string): Promise<void> {
        try {
            this.isAuthLoading = true;
            await axios.post(this.$store.state.apiUrls.register,
                {
                    dataType: "json",
                    contentType: 'application/json; charset=utf-8',
                    email: this.email, password: this.password, type: 'auth', agreeTerms: (this.agreeTerms) ? 1 : 0 , recaptcha: recaptcha, route: router.currentRoute.value.fullPath
                }).then((data: any) => {
                    if (data.data.result == 1) {
                        this.$store.dispatch('auth/login', data.data.session);
                        this.toast.success(this.$i18n.locale == "cz" ? cz.labels.registrationSucceeded : en.labels.registrationSucceeded);
                    } else {
                        this.toast.error(data.data.message);
                    }
                }).catch((error) => {
                    console.log('dataerror', error);
                    this.toast.error(error.error);
                });
            this.isAuthLoading = false;
        } catch (error: any) {
            console.log(error);
            this.toast.error(error.error);
            this.isAuthLoading = false;
        }
    }

    //public async registerByFacebookRequest(recaptcha: string): Promise<void> {
    //    try {
    //        this.isFacebookLoading = true;

    //       FB.login( (response: { authResponse: any; }) => {
    //           if (response.authResponse) {
    //               FB.api('/me', ((response: any) => {
    //                   if (response.name != undefined) {
    //                       axios.post(this.$store.state.apiUrls.register,
    //                           {
    //                               dataType: "json",
    //                               contentType: 'application/json; charset=utf-8',
    //                               email: '', name: response.name.split(' ')[0], surname: (response.name.split(' ')[1] != undefined) ? response.name.split(' ')[1] : null, password: response.id, type: 'facebook', agreeTerms: 1, recaptcha: recaptcha, route: router.currentRoute.value.fullPath
    //                           }).then((data: any) => {
    //                               if (data.data.result == 1) {
    //                                   this.$store.dispatch('auth/login', data.data.session);
    //                                   this.toast.success(this.$i18n.locale == "cz" ? cz.labels.registrationSucceeded : en.labels.registrationSucceeded);
    //                               } else {
    //                                   this.toast.error(data.data.message);
    //                               }
    //                           }).catch((error) => {
    //                               console.log('dataerror', error);
    //                               this.toast.error(error.message);
    //                           });
    //                   } else {
    //                       console.log('dataerror', response);
    //                       this.toast.error(cz.labels.registrationfacebookfailed);
    //                   }

    //               }));
    //           }
    //        });
    //        this.isFacebookLoading = false;
    //    } catch (error: any) {
    //        this.toast.error(error.message);
    //        this.isFacebookLoading = false;
    //    }
    //}

    //public async registerByGoogleRequest(recaptcha: string): Promise<void> {
    //    try {
    //        this.isGoogleLoading = true;
    //        this.$gapi.login().then((data) => {
    //            console.log(this.$gapi.getUserData());

    //            const userData = this.$gapi.getUserData();
    //            axios.post(this.$store.state.apiUrls.register,
    //                {
    //                    dataType: "json",
    //                    contentType: 'application/json; charset=utf-8',
    //                    email: userData.email, name: userData.firstName, surname: userData.lastName, password: userData.accessToken, type: 'google', agreeTerms: 1, recaptcha: recaptcha, route: router.currentRoute.value.fullPath
    //                }).then((data: any) => {
    //                    if (data.data.result == 1) {
    //                        this.$store.dispatch('auth/login', data.data.session);
    //                        this.toast.success(this.$i18n.locale == "cz" ? cz.labels.registrationSucceeded : en.labels.registrationSucceeded);
    //                    } else {
    //                        this.toast.error(data.data.message);
    //                    }
    //                }).catch((error) => {
    //                    console.log('dataerror', error);
    //                    this.toast.error(error.error);
    //                });
    //        }).catch((error) => {
    //            console.log('dataerror', error);
    //            this.toast.error(error.error);
    //        });
    //        this.isGoogleLoading = false;
    //    } catch (error: any) {
    //        console.log(error);
    //        this.toast.error(error.message);
    //        this.isGoogleLoading = false;
    //    }
    //}
}

