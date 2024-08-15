import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import store from '@/store/index';
import axios from 'axios';

import Main from '@/modules/main/main.vue';
import Login from '@/modules/login/login.vue';
import Register from '@/modules/register/register.vue';

import Dashboard from '@/pages/dashboard/dashboard.vue';
import Profile from '@/pages/profile/profile.vue';

import Inbox from '@/pages/inbox/inbox.vue';
import Sent from '@/pages/sent/sent.vue';
import Reademail from '@/pages/reademail/reademail.vue';
import Writeemail from '@/pages/writeemail/writeemail.vue';

import ForgotPassword from '@/modules/forgotpassword/forgotpassword.vue';
import ResetPassword from '@/modules/resetpassword/resetpassword.vue';
import PrivacyPolicy from '@/modules/privacy-policy/privacy-policy.vue';
import ContactUs from '@/pages/contactus/contactus.vue';

import Blank from '@/pages/blank/blank.vue';
import Servers from '@/pages/servers/servers.vue';
import ContentEditor from '@/pages/contentEditor/contentEditor.vue';
import PlcFactory4 from '@/pages/plc/plc.vue';
import Multiplatform from '@/pages/multiplatform/multiplatform.vue';
import DataBridges from '@/pages/databridges/databridges.vue';
import DesktopApplications from '@/pages/desktopapplications/desktopapplications.vue';
import WebApplications from '@/pages/webapplications/webapplications.vue';
import ControlingBi from '@/pages/controlingbi/controlingbi.vue';
import GraphicsApp from '@/pages/graphicsapp/graphicsapp.vue';
import ApiImplementation from '@/pages/apiimplementation/apiimplementation.vue';
import RemoteSupport from '@/pages/remotesupport/remotesupport.vue';
import CustomAppWeb from '@/pages/customappweb/customappweb.vue';
import OpenSolutions from '@/pages/opensolutions/opensolutions.vue';
import Backuping from '@/pages/backuping/backuping.vue';
import SpecificHw from '@/pages/specifichw/specifichw.vue';
import References from '@/pages/references/references.vue';
import PriceList from '@/pages/pricelist/pricelist.vue';
import Awards from '@/pages/awards/awards.vue';
import Eshop from '@/pages/eshop/eshop.vue';
import ManageEshopItems from '@/pages/manageEshopItems/manageEshopItems.vue';
import EshopItemEdit from '@/pages/eshopItemEdit/eshopItemEdit.vue';
import EshopItemDetail from '@/pages/eshopItemDetail/eshopItemDetail.vue';
import Basket from '@/pages/basket/basket.vue';
import Calendar from '@/pages/calendar/calendar.vue';

import EasyDataCenter from '@/pages/easydatacenter/easydatacenter.vue';
import EasyBuilder from '@/pages/easybuilder/easybuilder.vue';
import ProductsDevelopment from '@/pages/productsdevelopment/productsdevelopment.vue';
import Documentation from '@/pages/documentation/documentation.vue';
import PhotoGallery from '@/pages/photogallery/photogallery.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Main',
        component: Main,
        meta: {
            requiresAuth: false
        },
        children: [
            {
                path: 'easydatacenter',
                name: 'easydatacenter',
                component: EasyDataCenter,
                meta: {
                    requiresAuth: false
                }
            },
            {
                path: 'easybuilder',
                name: 'easybuilder',
                component: EasyBuilder,
                meta: {
                    requiresAuth: false
                }
            },
            {
                path: 'basket',
                name: 'Basket',
                component: Basket,
                meta: {
                    requiresAuth: false
                }
            },
            {
                path: 'eshopItemDetail',
                name: 'EshopItemDetail',
                component: EshopItemDetail,
                meta: {
                    requiresAuth: false
                }
            },
            {
                path: 'eshop',
                name: 'Eshop',
                component: Eshop,
                meta: {
                    requiresAuth: false
                }
            },
            {
                path: 'calendar',
                name: 'Calendar',
                component: Calendar,
                meta: {
                    requiresAuth: true
                }
            },
            {
                path: 'contenteditor',
                name: 'ContentEditor',
                component: ContentEditor,
                meta: {
                    requiresAuth: true
                }
            },
            {
                path: 'manageEshopItems',
                name: 'ManageEshopItems',
                component: ManageEshopItems,
                meta: {
                    requiresAuth: true
                }
            },
            {
                path: 'eshopItemEdit',
                name: 'EshopItemEdit',
                component: EshopItemEdit,
                meta: {
                    requiresAuth: true
                }
            },
            {
                path: 'servers',
                name: 'Servers',
                component: Servers,
                meta: {
                    requiresAuth: false
                }
            },
            {
                path: 'plc&factory4',
                name: 'plcFactory4',
                component: PlcFactory4,
                meta: {
                    requiresAuth: false
                }
            },
            {
                path: 'databridges',
                name: 'databridges',
                component: DataBridges,
                meta: {
                    requiresAuth: false
                }
            },
            {
                path: 'desktopapplications',
                name: 'desktopapplications',
                component: DesktopApplications,
                meta: {
                    requiresAuth: false
                }
            },
            {
                path: 'webapplications',
                name: 'webapplications',
                component: WebApplications,
                meta: {
                    requiresAuth: false
                }
            },
            {
                path: 'controlingbi',
                name: 'controlingbi',
                component: ControlingBi,
                meta: {
                    requiresAuth: false
                }
            },
            {
                path: 'graphicsapp',
                name: 'graphicsapp',
                component: GraphicsApp,
                meta: {
                    requiresAuth: false
                }
            },
            {
                path: 'apiimplementation',
                name: 'apiimplementation',
                component: ApiImplementation,
                meta: {
                    requiresAuth: false
                }
            },
            {
                path: 'remotesupport',
                name: 'remotesupport',
                component: RemoteSupport,
                meta: {
                    requiresAuth: false
                }
            },
            {
                path: 'customappweb',
                name: 'customappweb',
                component: CustomAppWeb,
                meta: {
                    requiresAuth: false
                }
            },
            {
                path: 'opensolutions',
                name: 'opensolutions',
                component: OpenSolutions,
                meta: {
                    requiresAuth: false
                }
            },
            {
                path: 'backuping',
                name: 'backuping',
                component: Backuping,
                meta: {
                    requiresAuth: false
                }
            },
            {
                path: 'specifichw',
                name: 'specifichw',
                component: SpecificHw,
                meta: {
                    requiresAuth: false
                }
            },
            {
                path: 'references',
                name: 'references',
                component: References,
                meta: {
                    requiresAuth: false
                }
            },
            {
                path: 'multiplatform',
                name: 'multiplatform',
                component: Multiplatform,
                meta: {
                    requiresAuth: false
                }
            },
            {
                path: 'inbox',
                name: 'Inbox',
                component: Inbox,
                meta: {
                    requiresAuth: true
                }
            },
            {
                path: 'sent',
                name: 'Sent',
                component: Sent,
                meta: {
                    requiresAuth: true
                }
            },
            {
                path: 'writeemail',
                name: 'Writeemail',
                component: Writeemail,
                meta: {
                    requiresAuth: true
                }
            },
            {
                path: 'reademail',
                name: 'Reademail',
                component: Reademail,
                meta: {
                    requiresAuth: true
                }
            },
            {
                path: 'profile',
                name: 'Profile',
                component: Profile,
                meta: {
                    requiresAuth: true
                }
            },
            {
                path: 'blank',
                name: 'Blank',
                component: Blank,
                meta: {
                    requiresAuth: false
                }
            },
            {
                path: 'pricelist',
                name: 'priceList',
                component: PriceList,
                meta: {
                    requiresAuth: false
                }
            },
            {
                path: 'awards',
                name: 'awards',
                component: Awards,
                meta: {
                    requiresAuth: false
                }
            },
            {
                path: 'contactus',
                name: 'contactUs',
                component: ContactUs,
                meta: {
                    requiresAuth: false
                }
            },
            {
                path: '',
                name: 'Dashboard',
                component: Dashboard,
                meta: {
                    requiresAuth: false
                }
            },
            {
                path: 'privacy-policy',
                name: 'PrivacyPolicy',
                component: PrivacyPolicy,
                meta: {
                    requiresAuth: false
                }
            },
            {
                path: '/productsdevelopment',
                name: 'ProductsDevelopment',
                component: ProductsDevelopment,
                meta: {
                    requiresAuth: false
                }
            },
            {
                path: '/documentation',
                name: 'Documentation',
                component: Documentation,
                meta: {
                    requiresAuth: false
                }
            },
            {
                path: '/photogallery',
                name: 'PhotoGallery',
                component: PhotoGallery,
                meta: {
                    requiresAuth: false
                }
            }
        ]
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: {
            requiresUnauth: true
        }
    },
    {
        path: '/register',
        name: 'Register',
        component: Register,
        meta: {
            requiresUnauth: true
        }
    },
    {
        path: '/forgotpassword',
        name: 'ForgotPassword',
        component: ForgotPassword,
        meta: {
            requiresUnauth: true
        }
    },
    {
        path: '/resetpassword',
        name: 'ResetPassword',
        component: ResetPassword,
        meta: {
            requiresUnauth: true
        }
    },
    {
        path: '/privacy-policy',
        name: 'PrivacyPolicy',
        component: PrivacyPolicy,
        meta: {
            requiresUnauth: false
        }
    }
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
});

router.beforeEach((to, from, next) => {
    axios.post(store.state.apiUrls.writeVisit, {
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        route: to.path
    });

    //mobile detection
    $(function () {
        const isMobile = window.matchMedia("only screen and (max-width: 760px)").matches;
        if (isMobile) {
            if (store.getters['ui/menuSidebarCollapsed']) {
                store.dispatch('ui/toggleMenuSidebar');
            }
        }
    });

    if (to.meta.requiresAuth == undefined || !to.meta.requiresAuth) {
        next();
    } else if (to.meta.requiresAuth && !store.getters['auth/token']) {
        next('/login');
    } else if ((to.meta.requiresUnauth || !to.meta.requiresAuth) && !!store.getters['auth/token']) {
        next('/');
    } else {
        next();
    }
});

export default router;
