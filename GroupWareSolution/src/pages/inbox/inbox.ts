import {Options, Vue} from 'vue-class-component';
import axios from 'axios';
import router from '@/router/index';

@Options({})
export default class Inbox extends Vue {
    private emails: any = [];
    private pageNo: number = 0;
    private nextPageAllowed = false;
    private selectedAll = false;

    public selectAll(): void {
        this.selectedAll = !this.selectedAll;
        this.emails.forEach((email: any) => {
            email.selected = this.selectedAll;
        });
    }

    public selectId(Id: number): void {
        this.emails[Id].selected = !this.emails[Id].selected;
    }

    public readEmail(Id: number): void {
        this.$store.state.selectedMail = {id:Id, direction:"to"};
        router.replace('/reademail');
    }

    public async mounted(): Promise<void> {
        await axios.post(this.$store.state.apiUrls.getEmails, {
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            session: this.$store.getters['auth/token'], lastTimestamp: '', pageNo: this.pageNo, direction:'to'
        }).then((data: any) => {
            if (data.data.result == 1 && data.data.emails != []) {
                if (data.data.emails != []) {
                    data.data.emails.forEach((email: any) => {
                        email.selected = false;
                        this.emails.push(JSON.parse(JSON.stringify(email)));
                    });
                    if (data.data.emails.length >= 10) { this.nextPageAllowed = true; } else { this.nextPageAllowed = false; }
                }
            }
        }).catch((error) => {
            console.log('dataerror', error);
        });
    }

    public async deleteEmail(): Promise<void> {
        const deleteEmails: any[] = [];
        this.emails.forEach((email: any, index: number, thisArray: any) => {
            if (email.selected) { deleteEmails.push(email.id); }

            if (index == thisArray.length - 1) {
                axios.post(this.$store.state.apiUrls.deleteEmails, {
                    dataType: "json",
                    contentType: 'application/json; charset=utf-8',
                    session: this.$store.getters['auth/token'], emails: deleteEmails
                }).then((data: any) => {
                    if (data.data.result == 1) {
                        this.otherPage(0);
                    }
                }).catch((error) => {
                    console.log('dataerror', error);
                });
            }
        });
    }

    public async otherPage(direction: number): Promise<void>  {
        this.pageNo += direction; this.emails = []; this.selectedAll = false;
        await axios.post(this.$store.state.apiUrls.getEmails, {
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            session: this.$store.getters['auth/token'], lastTimestamp: '', pageNo: this.pageNo, direction: 'to'
        }).then((data: any) => {
            if (data.data.result == 1 && data.data.emails != []) {
                if (data.data.emails != []) {
                    data.data.emails.forEach((email: any) => {
                        email.selected = false;
                        this.emails.push(JSON.parse(JSON.stringify(email)));
                    });
                    if (data.data.emails.length >= 10) { this.nextPageAllowed = true; } else { this.nextPageAllowed = false;}
                }
            }
        }).catch((error) => {
            console.log('dataerror', error);
        });
    }
}
