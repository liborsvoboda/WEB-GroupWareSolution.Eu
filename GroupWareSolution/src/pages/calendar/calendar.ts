import { Options, setup, Vue } from 'vue-class-component';
import '@fullcalendar/core/vdom'; // solve problem with Vite
import useVuelidate from "@vuelidate/core";
import { IUser } from '@/interfaces/user';
import { useToast } from 'vue-toastification';
import axios from 'axios';
import router from '@/router/index';
import FullCalendar, { CalendarOptions, EventApi, DateSelectArg, EventClickArg, EventInput, Calendar, EventDropArg } from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { EventResizeDoneArg } from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { INITIAL_EVENTS, createEventId, loadApi, translate, CalendarNameLoaded } from '../../services/event-utils';
import MenuItem from '@/components/menu-item/menu-item.vue';
import { Watch } from 'vue-property-decorator';
import uiModule from '../../store/ui';
import store from '../../store';
import authModule from '../../store/auth';
import listPlugin from '@fullcalendar/list';
import momentPlugin from '@fullcalendar/moment';
import googleCalendarPlugin from '@fullcalendar/google-calendar';
import iCalendarPlugin from '@fullcalendar/icalendar';
import { wrapVDomGenerator, createVueContentTypePlugin } from '../../services/custom_content_type';

import en from '@fullcalendar/core/locales/en-gb';
import cs from '@fullcalendar/core/locales/cs';

import len from '@/translation/en.json';
import lcz from '@/translation/cz.json';
import { createSlots } from 'vue';

@Options({
    components: {
        'FullCalendar': FullCalendar,
        'app-menu-item': MenuItem
    }
})
export default class Calendars extends Vue {
    [x: string]: any;
    public eventGuid: number = 0;
    private todayStr = new Date().toISOString().replace(/T.*$/, ''); // YYYY-MM-DD of today
    private toast = useToast();
    private calendarPath: string = '';
    private calendarOldPath: string = '';
    private menu: any[] = null;
    private calendarAgendas: any[] = [];
    private menuIndex: number = 0;

    calendarOptions: CalendarOptions = {
        plugins: [
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            listPlugin,
            momentPlugin,
            googleCalendarPlugin,
            iCalendarPlugin
        ],
        googleCalendarApiKey: this.googleCalendarApiKey,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        initialView: 'dayGridMonth',
        initialEvents: [],
        events: (this.googleCalendarId) ? { googleCalendarId: this.googleCalendarId, className: 'gcal-event' } : (this.iCalendar) ? { url: this.iCalendar, format: 'ics' } : INITIAL_EVENTS,
        eventDisplay: 'auto',
        navLinks: true,
        editable: true,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        weekends: true,
        eventOverlap: true,
        progressiveEventRendering: true,
        select: this.handleDateSelect,
        eventClick: this.handleEventClick,
        eventsSet: this.handleEvents,
        eventDrop: this.handleEventDrop,
        eventResize: this.handleEventResizeDone,
        eventInteractive: true,
        eventResizableFromStart: true,
        forceEventDuration: true,
        locales: [cs, en],
        timeZone: 'UTC',
        weekNumbers: true,
        weekNumberCalculation: "local",
        displayEventTime: true,
        displayEventEnd: true,
        dragRevertDuration: 500,
        showNonCurrentDates: true,
        lazyFetching: true,
        eventDidMount: function (info) {
            //console.log("eventDidMount", info.event.extendedProps);
        },
        viewDidMount: function (info) {
            //info.view.calendar.removeAllEventSources();
            //INITIAL_EVENTS.forEach((event) => {
            //    info.view.calendar.addEvent(event);
            //});
            //console.log("viewDidMount", info.view, INITIAL_EVENTS);
        },
    }
    /* you can update a remote database when these fire:
        eventAdd:
        eventChange:
        eventRemove:
    */

    private LOCAL_INITIAL_EVENTS: EventInput[] = [];
    private currentEvents: EventApi[] = [];

    public async mounted(): Promise<void> {
        loadApi().then((data) => {
            this.calendarOptions.events = INITIAL_EVENTS;
            this.calendarOptions.locale = (this.$i18n.locale == "cz") ? 'cs' : this.$i18n.locale;
        });
    }

    private async updateMainMenu() {

        this.$store.state.menu.forEach((menu: any, index: number) => { if (menu.name == 'labels.calendarAgendas') {this.menuIndex = index;} });
        if (this.menuIndex > -1) { this.$store.state.menu.splice(this.menuIndex, 1); }

        axios.post(this.$store.state.apiUrls.getCalendarAgendas, {
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            session: this.$store.getters['auth/token']
        }).then((data: any) => {
            if (data.data.result == 1) {
                this.calendarAgendas = [];
                data.data.agendas.forEach((agenda: any, index: number, count: any[]) => {
                    agenda.path = '/calendar?selected=' + agenda.name;
                    this.calendarAgendas.push({ name: agenda.name, path: agenda.path });

                    if (index == count.length - 1) {
                        //this.$store.state.menu.splice(2, 0, { name: 'labels.calendarAgendas', children: JSON.parse(JSON.stringify(this.calendarAgendas)) });
                        this.$store.state.menu.push({ name: 'labels.calendarAgendas', children: this.calendarAgendas });
                        router.push(agenda.path);
                    }
                });
            }
        });

    }

    private async createCalendar() {
        const title = prompt(translate('newCalendar'));
        if (title) {
            await axios.post(this.$store.state.apiUrls.setNewCalendar,
                {
                    dataType: "json",
                    contentType: 'application/json; charset=utf-8',
                    session: this.$store.state.auth.token, name: this.calendarName, content: JSON.stringify(INITIAL_EVENTS).toString()
                }).then((data: any) => {
                    if (data.data.result == 1) {
                        this.updateMainMenu();
                    }
                }).catch((error) => {
                    console.log('dataerror', error);
                });
        }
    }

    private async deleteCalendar() {
        const title = confirm(translate('deleteCalendarQuestion').concat(" ", this.calendarName));
        if (title) {
            await axios.post(this.$store.state.apiUrls.deleteCalendar,
                {
                    dataType: "json",
                    contentType: 'application/json; charset=utf-8',
                    session: this.$store.state.auth.token, name: this.calendarName
                }).then((data: any) => {
                    if (data.data.result == 1) {
                        this.updateMainMenu();
                    }
                }).catch((error) => {
                    console.log('dataerror', error);
                });
        }
    }

    private async handleDateSelect(selectInfo: DateSelectArg) {
        const title = prompt(translate('newEvent'));

        const calendarApi = selectInfo.view.calendar;
        const recId = createEventId();

        calendarApi.unselect();
        if (title) {
            calendarApi.addEvent({
                id: recId,
                title,
                start: selectInfo.startStr,
                end: selectInfo.endStr,
                allDay: selectInfo.allDay
            });
        }

        this.LOCAL_INITIAL_EVENTS = [];
        this.currentEvents.forEach(event => {
            this.LOCAL_INITIAL_EVENTS.push({ id: event.id, title: event.title, start: event.startStr, end: event.endStr, allDay: event.allDay });
        });

        await axios.post(store.state.apiUrls.updateCalendar,
            {
                dataType: "json",
                contentType: 'application/json; charset=utf-8',
                session: authModule.state.token, name: CalendarNameLoaded, content: JSON.stringify(this.LOCAL_INITIAL_EVENTS).toString().replace(/"/g, "'")
            });
    }

    async handleEventClick(clickInfo: EventClickArg) {
        if (confirm(translate('deleteEvent').concat(" " + clickInfo.event.title))) {
            clickInfo.event.remove();
        }

        this.LOCAL_INITIAL_EVENTS = [];
        this.currentEvents.forEach(event => {
            this.LOCAL_INITIAL_EVENTS.push({ id: event.id, title: event.title, start: event.startStr, end: event.endStr, allDay: event.allDay});
        });
        await axios.post(store.state.apiUrls.updateCalendar,
            {
                dataType: "json",
                contentType: 'application/json; charset=utf-8',
                session: authModule.state.token, name: CalendarNameLoaded, content: JSON.stringify(this.LOCAL_INITIAL_EVENTS).toString().replace(/"/g, "'")
            });
    }

    async handleEventDrop(dropInfo: EventDropArg) {
        this.LOCAL_INITIAL_EVENTS = [];
        this.currentEvents.forEach(event => {
            this.LOCAL_INITIAL_EVENTS.push({ id: event.id, title: event.title, start: event.startStr, end: event.endStr, allDay: event.allDay });
        });
        await axios.post(store.state.apiUrls.updateCalendar,
            {
                dataType: "json",
                contentType: 'application/json; charset=utf-8',
                session: authModule.state.token, name: CalendarNameLoaded, content: JSON.stringify(this.LOCAL_INITIAL_EVENTS).toString().replace(/"/g, "'")
            });
    }

    async handleEventResizeDone(dropInfo: EventResizeDoneArg) {
        this.LOCAL_INITIAL_EVENTS = [];
        this.currentEvents.forEach(event => {
            this.LOCAL_INITIAL_EVENTS.push({ id: event.id, title: event.title, start: event.startStr, end: event.endStr, allDay: event.allDay });
        });
        await axios.post(store.state.apiUrls.updateCalendar,
            {
                dataType: "json",
                contentType: 'application/json; charset=utf-8',
                session: authModule.state.token, name: CalendarNameLoaded, content: JSON.stringify(this.LOCAL_INITIAL_EVENTS).toString().replace(/"/g, "'")
            });
    }

    handleEvents(events: EventApi[]) {
        this.currentEvents = events;
    }

    public handleWeekendsToggle() {
        this.calendarOptions.weekends = !this.calendarOptions.weekends;
    }

    get user(): IUser {
        return this.$store.getters['auth/user'];
    }

    get locale():string {
        return this.$i18n.locale;
    }

    get calendarName(): string {
        if (router.currentRoute.value.query['selected'] != undefined) {
            if (this.calendarPath != router.currentRoute.value.query['selected'].toString()) {
                this.calendarOldPath = this.calendarPath;
                this.calendarPath = router.currentRoute.value.query['selected'].toString();
            }
        } else { this.calendarPath = ''; }
        return this.calendarPath;
    }
    
    @Watch('locale')
    @Watch('calendarName')
    onPropertyChanged(value: string, oldValue: string) {
    
        if (this.calendarOldPath != this.calendarPath && this.calendarOldPath.length > 0) {
           
            loadApi().then(() => {
                this.currentEvents = [];
                this.LOCAL_INITIAL_EVENTS = [];
                this.handleEvents(this.currentEvents);
                this.calendarOptions.eventSources = [];
                this.calendarOptions.events = INITIAL_EVENTS;
                this.calendarOptions.locale = (this.$i18n.locale == "cz") ? 'cs' : this.$i18n.locale;

                document.getElementById("calendar").remove();
                const calendar: HTMLDivElement = document.createElement('div');
                calendar.setAttribute("id", "calendar");
                document.getElementById('fullCalendar').appendChild(calendar);
                const fullcalendar = new Calendar(calendar, this.calendarOptions);
                fullcalendar.render();

            });
        }
    }
}

