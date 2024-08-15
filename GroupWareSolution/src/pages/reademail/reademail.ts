import {Options, Vue} from 'vue-class-component';
import axios from 'axios';
import { IUser } from '@/interfaces/user';
import router from '../../router';

@Options({})
export default class Reademail extends Vue {
    private email: any = {};

    get user(): IUser {
        return this.$store.getters['auth/user'];
    }

    downloadFile(Id: number) {
        const linkSource = this.email.attachments[Id].content;
        const downloadLink = document.createElement("a");
        const fileName = this.email.attachments[Id].fileName;

        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
    }

    replyTo() {
        this.$store.state.selectedMail.sendTo = (this.user.email != this.email.fromEmail) ? this.email.fromEmail : this.email.toEmail;
        this.$store.state.selectedMail.subject = "Re: " + this.email.subject;
        this.$store.state.selectedMail.content = null;
        router.push('writeemail');
    }

    forwardTo() {
        this.$store.state.selectedMail.sendTo = (this.user.email != this.email.fromEmail) ? this.email.fromEmail : this.email.toEmail;
        this.$store.state.selectedMail.subject = "Fw: " + this.email.subject;
        this.$store.state.selectedMail.content = "<p></p>Fw: " + this.email.content;
        router.push('writeemail');
    }

    public async mounted(): Promise<void> {
        this.$store.state.selectedMail.sendTo = null;
        this.$store.state.selectedMail.subject = null;
        this.$store.state.selectedMail.content = null;

        await axios.post(this.$store.state.apiUrls.readEmail, {
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            session: this.$store.getters['auth/token'], emailId: this.$store.state.selectedMail.id
        }).then((data: any) => {
            if (data.data.result == 1) {
                this.email = data.data.email;
               
            }
        }).catch((error) => {
            console.log('dataerror', error);
        });
    }

  
}
