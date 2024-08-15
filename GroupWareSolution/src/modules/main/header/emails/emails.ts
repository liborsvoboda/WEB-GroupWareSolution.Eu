import { Options, Vue } from 'vue-class-component';
import { IUser } from '@/interfaces/user';
import Dropdown from '@/components/dropdown/dropdown.vue';
import store from '../../../../store';
import router from '../../../../router';

@Options({
    name: 'emails-dropdown',
    components: {
        'app-dropdown': Dropdown
    }
})
export default class Emails extends Vue {
    [x: string]: any;
    private email: any = [];
    private emailsNotReaded: number = 0;
    private emailsReaded: number = 0;
    private emailsSent: number = 0;
    private socketEnabled: boolean = store.state.socket.isConnected;

    get user(): IUser {
        return this.$store.getters['auth/user'];
    }

    get lastTimestamp(): void {
        return (this.email[0] != undefined) ? this.email[0].timestamp : "";
    }

    //public readAll(): void {
    //    if (this.$store.state.socket.isConnected) {
    //        this.$socket.sendObj({ method: "readEmail", data: { session: this.$store.state.auth.token, lastTimestamp: this.lastTimestamp } });
    //        this.emailsNotReaded = this.emailsReaded = 0;
    //    }
    //}

    writeNewMail() {
        this.$store.state.selectedMail = { id: null, direction: null, sendTo: null, subject: null, content: null };
        router.push('writeemail');
    }

    public async mounted(): Promise<void> {
        if (this.$store.state.auth.token != null) {

            this.$store.state.socket.heartBeatTimer = setInterval(() => {
                if (this.user != null) {
                    this.$store.state.socket.isConnected && this.$socket.sendObj({ method: "getEmail", data: { session: this.$store.state.auth.token, lastTimestamp: "" } });
                    if (this.$store.state.socket.messageEmail.result == 1 && this.$store.state.socket.messageEmail != []) {
                        this.email = []; this.emailsReaded = this.emailsNotReaded = this.emailsSent = 0;
                        this.$store.state.socket.messageEmail.message.forEach((emailMessage: any) => {
                            if (this.email.filter(function (obj: { id: any; }) { if (obj.id == emailMessage.id) { return true; } }).length == 0) {
                                if (emailMessage.toEmail.toLowerCase() == this.user.email.toLowerCase()) {
                                    if (emailMessage.readed) { this.emailsReaded += 1; } else { this.emailsNotReaded += 1; }
                                } else { this.emailsSent += 1; }
                                this.email.unshift(JSON.parse(JSON.stringify(emailMessage)));
                            }
                        });
                    }
                }
            }, this.$store.state.socket.heartBeatInterval);
        }
    }
}
