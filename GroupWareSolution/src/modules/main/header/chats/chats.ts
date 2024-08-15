import { Options, Vue } from 'vue-class-component';
import { IUser } from '@/interfaces/user';
import Dropdown from '@/components/dropdown/dropdown.vue';
import store from '../../../../store';
import { useToast } from 'vue-toastification';
import useVuelidate from "@vuelidate/core";
import { required, email, minLength, sameAs } from "@vuelidate/validators";

import en from '@/translation/en.json';
import cz from '@/translation/cz.json';

@Options({
    name: 'chats-dropdown',
    components: {
        'app-dropdown': Dropdown
    },
    validations: {
        ownMessage: { required }
    }
})
export default class Chats extends Vue {
    [x: string]: any;
    private chat: any = [];
    private toEmail: string = '';
    private ownMessage: string = null;
    private chatEnabled: boolean = store.state.socket.isConnected;
    private toast = useToast();
    private chatNotReaded: number = 0;
    private chatReaded: number = 0;
    v$: any = useVuelidate();

    validations() {
        //console.log(this.v$.inputEditor.$invalid); //.inputName.$invalid this.editorContent.textContent
        return {
            ownMessage: { required }
        }
    }

    get user(): IUser {
        return this.$store.getters['auth/user'];
    }
    get lastTimestamp(): void {
        return (this.chat[0] != undefined) ? this.chat[0].timestamp : "";
    }

    public readAll(): void {
        if (this.$store.state.socket.isConnected) {
            this.$socket.sendObj({ method: "readChat", data: { session: this.$store.state.auth.token, lastTimestamp: this.lastTimestamp } });
            this.chatNotReaded = this.chatReaded = 0;
        }
    }


    public sendMessage(): void {
        if (this.$store.state.socket.isConnected) {
            this.$socket.sendObj({ method: "setChat", data: { session: this.$store.state.auth.token, toEmail: this.toEmail, message: this.ownMessage } });
            this.toast.success(this.$i18n.locale == "cz" ? cz.messages.messageSended : en.messages.messageSended);
            this.toEmail = ''; this.ownMessage = null;
        }
    }

    //this.$socket.send('some data');
    //this.$socket.sendObj({ awesome: 'data' });

    public async mounted(): Promise<void> {
        if (this.$store.state.auth.token != null) {
            
            this.$store.state.socket.heartBeatTimer = setInterval(() => {
                if (this.user != null) {
                    this.$store.state.socket.isConnected && this.$socket.sendObj({ method: "getChat", data: { session: this.$store.state.auth.token, lastTimestamp: this.lastTimestamp } });
                    if (this.$store.state.socket.messageChat.result == 1 && this.$store.state.socket.messageChat != []) {
                        this.$store.state.socket.messageChat.message.forEach((chatmessage: any) => {
                            if (this.chat.filter(function (obj: { id: any; }) { if (obj.id == chatmessage.id) { return true; } }).length == 0) {
                                if (chatmessage.toEmail.toLowerCase() == this.user.email.toLowerCase()) {
                                    if (chatmessage.readed) { this.chatReaded += 1; } else { { this.chatNotReaded += 1; } }
                                } else { this.chatReaded += 1; }
                                this.chat.unshift(JSON.parse(JSON.stringify(chatmessage)));
                            }
                        });
                    }
                }
            }, this.$store.state.socket.heartBeatInterval);
        }
    }
}

