import { Options, Vue } from 'vue-class-component';
import Checkbox from '@/components/checkbox/checkbox.vue';
import Input from '@/components/input/input.vue';
import Button from '@/components/button/button.vue';
import {useToast} from 'vue-toastification';
import axios from 'axios';
import router from '../../router';
import useVuelidate from "@vuelidate/core";
import { required, email, minLength, sameAs } from "@vuelidate/validators";

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
        password: { required }
    }
})
export default class Login extends Vue {
    private appElement: HTMLElement | null = null;
    public email: string = 'libor.svoboda@kliknetezde.cz';
    public password: string = null;
    public rememberMe: boolean = false;
    public isAuthLoading: boolean = false;
    public isFacebookLoading: boolean = false;
    public isGoogleLoading: boolean = false;
    private toast = useToast();
    public GoogleisSignedIn: boolean = false;
    v$: any = useVuelidate();

    validations() {
        return {
            email: { required, email },
            password: { required }
        }
    }

    //public computed(): any {
    //    const user = this.$gapi.getUserData()
    //    console.log(this.$gapi);
    //    if (user) {
    //        return user.firstName
    //    }
    //}

    //public created() {
    //    this.$gapi.listenUserSignIn((isSignedIn) => {
    //        this.GoogleisSignedIn = isSignedIn;
    //    })
    //}

    public mounted(): void {
        this.appElement = document.getElementById('app') as HTMLElement;
        this.appElement.classList.add('login-page');
    }

    public unmounted(): void {
        (this.appElement as HTMLElement).classList.remove('login-page');
    }

    async loginByAuth(authType: string): Promise<void> {
        grecaptcha.ready(() => {
            grecaptcha.execute('6Lel4uIdAAAAADiYGEkn82jnMT-rlbIuP5G_c8wJ', { action: 'homepage' }).then((token: any) => {
                if (authType == 'auth') { this.loginByAuthRequest(token); }
                //else if (authType == 'facebook') { this.loginByFacebookRequest(token); }
                //else if (authType == 'google') { this.loginByGoogleRequest(token); }
            });
        });
    }

    public async loginByAuthRequest(recaptcha: string): Promise<void> {
        try {
            this.isAuthLoading = true;
            await axios.post(this.$store.state.apiUrls.login,
                {
                    dataType: "json",
                    contentType: 'application/json; charset=utf-8',
                    email: this.email, password: this.password, recaptcha: recaptcha, type: 'auth', route: router.currentRoute.value.fullPath
                }).then((data: any) => {
                    if (data.data.result == 1) {
                        this.$store.dispatch('auth/login', data.data.session);
                        this.toast.success(this.$i18n.locale == "cz" ? cz.labels.loginSucceeded : en.labels.loginSucceeded);
                    } else {
                        this.toast.error(data.data.message);
                    }
                }).catch((error) => {
                    console.log('dataerror', error);
                    this.toast.error(error.message);
                });
            this.isAuthLoading = false;
        } catch (error: any) {
            console.log(error);
            this.toast.error(error.message);
            this.isAuthLoading = false;
        }
    }

    //public async loginByFacebookRequest(recaptcha: string): Promise<void> {
    //    try {
    //        this.isFacebookLoading = true;

    //        FB.login((response: { authResponse: any; }) => {
    //            if (response.authResponse) {
    //                FB.api('/me', ((response: any) => {
    //                    axios.post(this.$store.state.apiUrls.login,
    //                        {
    //                            dataType: "json",
    //                            contentType: 'application/json; charset=utf-8',
    //                            email: '', password: response.id, type: 'facebook', agreeTerms: 1, recaptcha: recaptcha, route: router.currentRoute.value.fullPath
    //                        }).then((data: any) => {
    //                            if (data.data.result == 1) {
    //                                this.$store.dispatch('auth/login', data.data.session);
    //                                this.toast.success(this.$i18n.locale == "cz" ? cz.labels.registrationSucceeded : en.labels.registrationSucceeded);
    //                            } else {
    //                                this.toast.error(data.data.message);
    //                            }
    //                        }).catch((error) => {
    //                            console.log('dataerror', error);
    //                            this.toast.error(error.message);
    //                        });

    //                }));
    //            }
    //        });

    //        this.isFacebookLoading = false;
    //    } catch (error: any) {
    //        this.toast.error(error.message);
    //        this.isFacebookLoading = false;
    //    }
    //}


    //public loginByGoogleRequest(recaptcha: string) {
    //    this.isAuthLoading = true;

    //    this.$gapi.login().then((data) => {
    //        console.log(this.$gapi.getUserData());

    //        const userData = this.$gapi.getUserData();
    //        axios.post(this.$store.state.apiUrls.login,
    //            {
    //                dataType: "json",
    //                contentType: 'application/json; charset=utf-8',
    //                email: userData.email, accessToken: userData.accessToken, recaptcha: recaptcha, route: router.currentRoute.value.fullPath, type: 'google'
    //            }).then((data: any) => {
    //                if (data.data.result == 1) {
    //                    this.$store.dispatch('auth/login', data.data.session);
    //                    this.toast.success(this.$i18n.locale == "cz" ? cz.labels.loginSucceeded : en.labels.loginSucceeded);
    //                } else {
    //                    this.toast.error(data.data.message);
    //                }
    //            }).catch((error) => {
    //                console.log('dataerror', error);
    //                this.toast.error(error.message);
    //            });
          
    //    });
    //    this.isAuthLoading = false;
    //}
}
