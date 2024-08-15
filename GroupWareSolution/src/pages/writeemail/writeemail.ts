import { Options, Vue } from 'vue-class-component';
import useVuelidate from "@vuelidate/core";
import { required, email, minLength, sameAs } from "@vuelidate/validators";
import { IUser } from '@/interfaces/user';
import { useToast } from 'vue-toastification';
import axios from 'axios';

import en from '@/translation/en.json';
import cz from '@/translation/cz.json';

@Options({
    validations: {
        inputName: { required },
        inputEmail: { required, email },
        inputSubject: { required }
    }
})
export default class Writeemail extends Vue {
    private editorToolbar: HTMLDivElement | null = null;
    private editorContent: HTMLDivElement | null = null;

    private filesArray: Array<any> = [];

    public inputName: string = '';
    private inputEmail: string = '';
    private inputSubject: string = '';
    private toast = useToast();
    v$: any = useVuelidate();

    get user(): IUser {
        return this.$store.getters['auth/user'];
    }

    deleteFile(Id: number) {
        this.filesArray.splice(Id, 1);
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
                this.filesArray.push({ fileName: file.name, size: file.size, mimeType: (file.type != "") ? file.type : "text/plain", content: fileByteArray, source: "email" })
            }
        }
    }

    validations() {
        return {
            inputName: { required, minLength: minLength(1) },
            inputEmail: { required, email },
            inputSubject: { required }
        }
    }

    public mounted(): void {
        this.editorToolbar = document.querySelector('.ql-toolbar') as HTMLDivElement;
        this.editorContent = document.getElementById('inputEditor') as HTMLDivElement;
        this.editorToolbar.classList.add('form-control');
        this.editorContent.classList.add('form-control');
        this.editorContent.style.height = '100px';

        this.inputName = this.user.name + ' ' + this.user.surname;
        this.inputEmail = this.user.email;
        this.inputSubject = this.$store.state.selectedMail.subject;
        this.editorContent.childNodes[0].innerHTML = this.$store.state.selectedMail.content;
    }

    async sendMessage(): Promise<void> {
        try {
            await axios.post(this.$store.state.apiUrls.sendEmail,
                {
                    dataType: "json",
                    contentType: 'application/json; charset=utf-8',
                    session: this.$store.state.auth.token, toEmail: (this.$store.state.selectedMail.sendTo != null) ? this.$store.state.selectedMail.sendTo : null, fromName: this.inputName, fromEmail: this.inputEmail, subject: this.inputSubject, content: this.editorContent.textContent, attachments: this.filesArray
                }).then((data: any) => {
                    if (data.data.result == 1) {
                        this.toast.success(this.$i18n.locale == "cz" ? cz.messages.messageSended : en.messages.messageSended);
                        if (this.user != null) {
                            this.inputName = this.user.name + ' ' + this.user.surname;
                            this.inputEmail = this.user.email;
                        } else {
                            this.inputName = ''; this.inputEmail = '';
                        }
                        this.inputSubject = ''; this.editorContent.childNodes[0].textContent = "";
                        this.filesArray = [];
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