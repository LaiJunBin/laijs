class Module {
    constructor() {
        this.components = [];
        this.componentsInstance = [];
        this.modulesInstance = [];
        this.routes = [];
        this.options = {};
    }

    static
    export (params) {
        let module = new Module();
        for (let key in params) {
            if (module[key] === undefined)
                throw new Error(`Module export error! unknow key: ${key}`)

            module[key] = params[key];
        }

        module.routerOutlets = [];
        App.modules.push(module);
    }

    getLastComponentInstance() {
        return this.componentsInstance.slice(-1)[0];
    }

    getComponentInstanceByPath(path) {
        console.log(this, path);
        let paths = uriTrimSlash(path).split('/');
        let module = this;
        for (let i = 0; i < paths.length; i++) {
            let currentModule = module.modulesInstance.find(m => m.name === paths[i]);
            if (currentModule === undefined) {
                break;
            }
            module = currentModule;
        }

        console.log(module.componentsInstance);
        return module.componentsInstance.find(c => c.path.endsWith(path)) || null;
    }
}