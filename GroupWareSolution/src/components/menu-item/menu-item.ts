import {Options, Vue} from 'vue-class-component';
import router from '@/router/index';

@Options({
    name: 'app-menu-item',
    props: {
        menuItem: Object,
        icon: String,
        type: String,
        placeholder: String,
        autocomplete: String
    }
})
export default class MenuItem extends Vue {
    private menuItem: any;
    private isMenuExtended: boolean = false;
    private isExpandable: boolean = false;
    private isMainActive: boolean = false;
    private isOneOfChildrenActive: boolean = false;
    private divElement: HTMLDivElement | null = null;

    public mounted(): void {
        this.isExpandable = 
            this.menuItem &&
            this.menuItem.children &&
            this.menuItem.children.length > 0;
        //this.calculateIsActive(this.$router.currentRoute.value.fullPath);
        this.$router.afterEach((to) => {
            this.calculateIsActive(to.fullPath);
        });
    }

    public handleMainMenuAction() {
        this.$store.state.selectedMail.subject = null;
        this.$store.state.selectedMail.content = null;

        if (this.isExpandable) {
            this.toggleMenu();
            return;
        }

        this.$router.push(this.menuItem.path);
        
    }

    public toggleMenu() {
        this.isMenuExtended = !this.isMenuExtended;
    }

    public async calculateIsActive(url: string): Promise<void> {
        this.isMainActive = false;
        this.isOneOfChildrenActive = false;
        if (this.isExpandable) {
            this.menuItem.children.forEach((item: any) => {
                if (router.currentRoute.value.fullPath === item.path) {
                    this.isOneOfChildrenActive = true;
                    this.isMenuExtended = true;
                } else {
                    this.divElement = document.getElementById(item.path) as HTMLDivElement;
                    if (this.divElement != null ){
                        this.divElement.classList.remove('active');
                    }
                }
            });
        } else if (this.menuItem.path === url) {
            this.isMainActive = true;
        }

        if (!this.isMainActive && !this.isOneOfChildrenActive) {
            this.isMenuExtended = false;
        }
       
    
    }
}
