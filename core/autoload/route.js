class Route {
    constructor() {
        this.component = null;
        this.module = null;
        this.path = null;
        this.name = null;
    }

    static paths = [];

    static updatePath() {
        Route.paths = (location.hash.split('#/')[1] || '').split('/')
            .filter(x => ['', '.'].indexOf(x.trim()) == -1);
    }

    static create(routes) {
        let currentModule = App.currentLoadingModule;

        for (let params of routes) {
            let route = new Route();

            for (let key in params) {
                if (route[key] === undefined)
                    throw new Error(`Route create error! unknow key: ${key}`)

                route[key] = params[key];
            }

            route.path = uriTrimSlash(route.path);
            currentModule.routes.push(route);
        }
    }
}