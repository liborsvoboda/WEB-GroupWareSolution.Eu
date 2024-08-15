import {Options, Vue} from 'vue-class-component';
import Button from '@/components/button/button.vue';
import Input from '@/components/input/input.vue';
import {useToast} from 'vue-toastification';
import useVuelidate from "@vuelidate/core";
import { required, email, minLength, sameAs } from "@vuelidate/validators";
import axios from 'axios';

import en from '@/translation/en.json';
import cz from '@/translation/cz.json';
import router from '../../router';

@Options({
    components: {
        'app-input': Input,
        'app-button': Button
    },
    validations: {
        email: { required, email },
        password: { required, minLength: minLength(8) },
        rePassword: { required, sameAs: (password: string, rePassword: any) => { return password == rePassword.password } }
    }
})
export default class ResetPassword extends Vue {
    private appElement: HTMLElement | null = null;
    public email: string = null;
    public password: string = null;
    public rePassword: string = null;
    private toast = useToast();
    v$: any = useVuelidate();

    validations() {
        return {
            email: { required, email },
            password: { required, minLength },
            rePassword: { sameAs: sameAs(this.password, this.rePassword) }
        }
    }

    public mounted(): void {
        this.appElement = document.getElementById('app') as HTMLElement;
        this.appElement.classList.add('login-page');
        this.recoverPassword(null);
    }

    async recoverPassword(operation: string): Promise<void> {
        grecaptcha.ready(() => {
            grecaptcha.execute('6Lel4uIdAAAAADiYGEkn82jnMT-rlbIuP5G_c8wJ', { action: 'homepage' }).then((token: any) => {
                if (operation == 'login') { this.recoverPasswordRequest(token); }
                else { this.getResetPasswordRequest(token);}
            });
        });
    }

    public async recoverPasswordRequest(recaptcha: string): Promise<void> {
        try {
            await axios.post(this.$store.state.apiUrls.recoverPassword,
                {
                    dataType: "json",
                    contentType: 'application/json; charset=utf-8',
                    email: this.email, password: this.password, recaptcha: recaptcha, route: router.currentRoute.value.fullPath
                }).then((data: any) => {
                    if (data.data.result == 1) {
                        this.$store.dispatch('auth/login', data.data.session);
                        this.toast.success(this.$i18n.locale == "cz" ? cz.labels.recoveryPasswordSucceeded : en.labels.recoveryPasswordSucceeded);
                    } else {
                        this.toast.error(data.data.message);
                    }
                }).catch((error) => {
                    console.log('dataerror', error);
                    this.toast.error(error.error);
                });
        } catch (error: any) {
            console.log(error);
            this.toast.error(error.error);
        }
    }

    public async getResetPasswordRequest(recaptcha: string): Promise<void> {
        try {
            await axios.post(this.$store.state.apiUrls.getResetPassword,
                {
                    dataType: "json",
                    contentType: 'application/json; charset=utf-8',
                    confirmationPassword: router.currentRoute.value.query.confirm, recaptcha: recaptcha
                }).then((data: any) => {
                    if (data.data.result == 1) {
                        this.email = data.data.email;
                    } else {
                        this.toast.warning(this.$i18n.locale == "cz" ? cz.messages.confirmationRequestNotValid : en.messages.confirmationRequestNotValid);
                    }
                }).catch((error) => {
                    console.log('dataerror', error);
                    this.toast.error(error.error);
                });
        } catch (error: any) {
            console.log(error);
            this.toast.error(error.error);
        }
    }

    public unmounted(): void {
        (this.appElement as HTMLElement).classList.remove('login-page');
    }
}
