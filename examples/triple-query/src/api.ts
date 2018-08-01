import { IObjectOf } from "@thi.ng/api/api";
import { IView, ViewTransform } from "@thi.ng/atom/api";
import { EffectDef, EventDef, InterceptorContext } from "@thi.ng/interceptors/api";
import { EventBus } from "@thi.ng/interceptors/event-bus";
import { QuerySpec } from "@thi.ng/rstream-query/api";
import { TripleStore } from "@thi.ng/rstream-query/store";

/**
 * Function signature for main app components.
 */
export type AppComponent = (ctx: AppContext, ...args: any[]) => any;

/**
 * Derived view configurations.
 */
export type ViewSpec = string | [string, ViewTransform<any>];

/**
 * Structure of the overall application config object.
 * See `src/config.ts`.
 */
export interface AppConfig {
    events: IObjectOf<EventDef>;
    effects: IObjectOf<EffectDef>;
    domRoot: string | Element;
    initialState: any;
    rootComponent: AppComponent;
    ui: UIAttribs;
    views: Partial<Record<keyof AppViews, ViewSpec>>;
    data: {
        cities: string[][];
        countries: string[][];
        regions: string[];
        queries: IObjectOf<QuerySpec>;
    }
}

/**
 * Base structure of derived views exposed by the base app.
 * Add more declarations here as needed.
 */
export interface AppViews extends Record<keyof AppViews, IView<any>> {
    page: IView<number>;
    pagedTriples: IView<any>;
    cities: IView<any>;
    countries: IView<any>;
    sort: IView<[number, boolean]>;
}

/**
 * Helper interface to pre-declare keys of shared UI attributes for
 * components and so enable autocomplete & type safety.
 *
 * See `AppConfig` above and its use in `src/config.ts` and various
 * component functions.
 */
export interface UIAttribs {
    button: any;
    buttonDisabled: any;
    buttongroup: any;
    link: any;
    root: any;
    table: { root: any; head: any; headlink: any; row: any; cell: any },
    pager: { root: any; prev: any; pages: any; next: any; }
}

/**
 * Structure of the context object passed to all component functions
 */
export interface AppContext {
    bus: EventBus;
    views: AppViews;
    ui: UIAttribs;
    store: TripleStore;
}

export interface AppInterceptorContext extends InterceptorContext {
    store: TripleStore;
}
