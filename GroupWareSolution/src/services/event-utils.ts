import { EventInput } from '@fullcalendar/vue3'
import axios from 'axios';
import store from '../store';
import authModule from '../store/auth';
import uiModule from '../store/ui';
import router from '@/router/index';

let eventGuid: number = 0;

import en from '@/translation/en.json';
import cz from '@/translation/cz.json';

export let INITIAL_EVENTS: EventInput[] = [];

export let CalendarNameLoaded: string = "";

export function createEventId() {
    eventGuid++;
    return String(eventGuid);
}

export async function loadApi(this: any) {

    try {
        const calendarName = router.currentRoute.value.query['selected'];

        await axios.post(store.state.apiUrls.getCalendarAgendas,
            {
                dataType: "json",
                contentType: 'application/json; charset=utf-8',
                session: authModule.state.token, id: authModule.state.user.ID, calendarName: calendarName
            }).then((data: any) => {
                if (data.data.result == 1) {
                    INITIAL_EVENTS = []; eventGuid = 0;
                    data.data.agendas.forEach((calendarAgendas: any) => {
                        CalendarNameLoaded = calendarAgendas.name;
                        calendarAgendas.content.forEach((contentItem: any) => {
                            const content = JSON.parse(JSON.stringify(contentItem));
                            content.allDay = (content.allDay == 'true') ? 1 : 0;
                            eventGuid = (eventGuid < content.id) ? content.id : eventGuid;
                            INITIAL_EVENTS.push(content);
                        });
                        //const agendaContent = JSON.parse(JSON.stringify(calendarAgendas.content));
                        //INITIAL_EVENTS = agendaContent;
                        //eventGuid = (calendarAgendas.content.length > 0) ? Math.max.apply(null, agendaContent.map(function(content: any) { return content.id; })) : 0;
                    });
                }
            }).catch((error) => {
                console.log('dataerror', error);
            });
    } catch (error: any) {
        console.log(error);
    }
}

export function translate(translation: string): string {
    let result = '';

    switch (translation + '_' + uiModule.state.Language) {
        case 'newEvent_cz':
            result = cz.labels.newEvent;
            break;
        case 'newEvent_en':
            result = en.labels.newEvent;
            break;
        case 'deleteEvent_cz':
            result = cz.labels.deleteEvent;
            break;
        case 'deleteEvent_en':
            result = en.labels.deleteEvent;
            break;
        case 'newCalendar_cz':
            result = cz.labels.newCalendar;
            break;
        case 'newCalendar_en':
            result = en.labels.newCalendar;
            break;
        case 'deleteCalendarQuestion_cz':
            result = cz.labels.deleteCalendarQuestion;
            break;
        case 'deleteCalendarQuestion_en':
            result = en.labels.deleteCalendarQuestion;
            break;
        case 'insertUrl_cz':
            result = cz.labels.insertUrl;
            break;
        case 'insertUrl_en':
            result = en.labels.insertUrl;
            break;
        default:
        // code block
    }

    return result;
}

export function shallowCopy(val: any) {
    if (typeof val === 'object') {
        if (Array.isArray(val)) {
            val = Array.prototype.slice.call(val)
        } else if (val) { // non-null
            val = { ...val }
        }
    }

    return val
}