import { createApp, h } from 'vue';
import { createPlugin } from '@fullcalendar/core';
/*
wrap it in an object with a `vue` key, which the custom content-type handler system will look for
*/
export function wrapVDomGenerator(vDomGenerator: any) {
    return function (props: any) {
        return { vue: vDomGenerator(props) };
    };
}
export function createVueContentTypePlugin(appContext: any) {
    return createPlugin({
        contentTypeHandlers: {
            vue: () => buildVDomHandler(appContext), // looks for the `vue` key
        }
    });
}
function buildVDomHandler(appContext: any) {
    let currentEl: any;
    let app: any;
    let componentInstance: any;
    function render(el: any, vDomContent: any) {
        if (currentEl !== el) {
            if (currentEl && app) { // if changing elements, recreate the vue
                app.unmount();
            }
            currentEl = el;
        }
        if (!app) {
            app = initApp(vDomContent, appContext);
            // vue's mount method *replaces* the given element. create an artificial inner el
            const innerEl = document.createElement('span');
            el.appendChild(innerEl);
            componentInstance = app.mount(innerEl);
        }
        else {
            componentInstance.content = vDomContent;
        }
    }
    function destroy() {
        if (app) { // needed?
            app.unmount();
        }
    }
    return { render, destroy };
}
function initApp(initialContent: any, appContext: any) {
    // TODO: do something with appContext
    return createApp({
        data() {
            return {
                content: initialContent,
            };
        },
        render() {
            const { content } = this;
            // the slot result can be an array, but the returned value of a vue component's
            // render method must be a single node.
            if (content.length === 1) {
                return content[0];
            }
            else {
                return h('span', {}, content);
            }
        }
    });
}
//# sourceMappingURL=custom-content-type.js.map