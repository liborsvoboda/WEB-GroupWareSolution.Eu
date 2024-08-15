/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Options, Vue } from 'vue-class-component';
import BasketMenu from './basketmenu/basketmenu.vue';
import Chats from './chats/chats.vue';
import Notifications from './notifications/notifications.vue';
import Emails from './emails/emails.vue';
import Languages from './languages/languages.vue';
import User from './user/user.vue';
import { IUser } from '@/interfaces/user';

@Options({
    components: {
        'basket-dropdown': BasketMenu,
        'chats-dropdown': Chats,
        'notifications-dropdown': Notifications,
        'emails-dropdown': Emails,
        'languages-dropdown': Languages,
        'user-dropdown': User
    }
})
export default class Header extends Vue {
    private headerElement: HTMLElement | null = null;
    public basketCount: number = 0;

    public async mounted(): Promise<void> {
        this.headerElement = document.getElementById(
            'main-header'
        ) as HTMLElement;

        //this.$store.state.ui.basket.forEach((item: any) => {
        //    if (item != '') {
        //        this.basketCount += 1;
        //    }
        //});
    }
    get user(): IUser {
        return this.$store.getters['auth/user'];
    }

    get basketItemCount() {
        this.basketCount = 0;
        this.$store.state.ui.basket.forEach((item: any) => {
            if (item != '') {
                this.basketCount += 1;
            }
        });
        return this.basketCount;
    }

    public onToggleMenuSidebar(): void {
        this.$store.dispatch('ui/toggleMenuSidebar');

        if (this.$store.getters['ui/menuSidebarCollapsed']) {
            document.getElementById('labelGS').style.display = 'none';
            document.getElementById('logoGS').style.display = 'flex';
            document.getElementById('tags_ball').style.display = 'none';

        } else {
            document.getElementById('logoGS').style.display = 'none';
            document.getElementById('labelGS').style.display = 'block';
            document.getElementById('tags_ball').style.display = 'initial';
        }
    
    }

    public onToggleControlSidebar(): void {
        this.$store.dispatch('ui/toggleControlSidebar');
    }

    get darkModeSelected() {
        return this.$store.getters['ui/darkModeSelected'];
    }

    get navbarVariant() {
        return this.$store.getters['ui/navbarVariant'];
    }
}
