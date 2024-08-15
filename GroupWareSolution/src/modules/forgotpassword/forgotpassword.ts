import {Options, Vue} from 'vue-class-component';
import useVuelidate from "@vuelidate/core";
import { required, email, minLength, sameAs } from "@vuelidate/validators";
import { useToast } from 'vue-toastification';
import axios from 'axios';

import en from '@/translation/en.json';
import cz from '@/translation/cz.json';

@Options({
    validations: {
        email: { required, email }
    }
})
export default class ForgotPassword extends Vue {
    private appElement: HTMLElement | null = null;
    public email: string = null;
    private toast = useToast();
    v$: any = useVuelidate();

    validations() {
        return {
            email: { required, email }
        }
    }

    async resetPassword(): Promise<void> {
        grecaptcha.ready(() => {
            grecaptcha.execute('6Lel4uIdAAAAADiYGEkn82jnMT-rlbIuP5G_c8wJ', { action: 'homepage' }).then((token: any) => {
                this.resetPasswordRequest(token);
            });
        });
    }

    public async resetPasswordRequest(recaptcha: string): Promise<void> {
        try {
            await axios.post(this.$store.state.apiUrls.resetPassword,
                {
                    dataType: "json",
                    contentType: 'application/json; charset=utf-8',
                    email: this.email, recaptcha: recaptcha, language: this.$i18n.locale
                }).then((data: any) => {
                    if (data.data.result == 1) {
                        this.email = null;
                        this.toast.success(this.$i18n.locale == "cz" ? cz.labels.resetPasswordSucceeded : en.labels.resetPasswordSucceeded);
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

    public mounted(): void {
        this.appElement = document.getElementById('app') as HTMLElement;
        this.appElement.classList.add('login-page');
    }

    public unmounted(): void {
        (this.appElement as HTMLElement).classList.remove('login-page');
    }
}
