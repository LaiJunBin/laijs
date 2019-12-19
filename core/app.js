// shared function
function url(uri = '') {
    if (uri.startsWith('http://') || uri.startsWith('https://'))
        return uri;

    return location.protocol + '//' +
        (location.host + location.pathname + uri)
        .split('/')
        .filter(x => ['', '.'].indexOf(x.trim()) == -1).join('/');
}

function uriTrimSlash(uri = '') {
    return uri.split('/')
        .filter(x => ['', '.'].indexOf(x.trim()) == -1).join('/');
}

async function appendScript(path, filename = '') {
    return new Promise(resolve => {
        let src = url(path);
        if (filename != '') {
            src += '/' + filename;
        }
        if (!src.endsWith('.js'))
            src += '.js';

        if (App.scripts.indexOf(src) == -1) {
            App.scripts.push(src);
            let script = document.createElement('script');
            script.src = src;
            document.head.append(script);

            script.onload = function () {
                resolve();
            }
        } else {
            resolve();
        }
    });
}

// app.js
class App {
    static currentLoadingModule = null;
    static modules = [];
    static scripts = [];

    static async loadModules(directory, moduleName = '', parentModuleIndex = -1) {
        Route.updatePath();
        let paths = Route.paths;

        let _loadModules = async function (directory, moduleName = '', parentModuleIndex = -1) {
            directory = uriTrimSlash(directory);
            return appendScript(directory, 'module').then(async () => {
                let currentModule = App.getModule(moduleName, directory) || App.getLastModule();

                if (currentModule.loadSuccess === undefined) {
                    App.currentLoadingModule = currentModule;
                    currentModule.loadSuccess = false;
                    currentModule.parentIndex = parentModuleIndex;
                    currentModule.name = moduleName || directory;
                    currentModule.path = directory;

                    await (async () => {
                        return new Promise(async resolve => {

                            if (currentModule.options.hasRoute) {
                                await appendScript(directory, 'route').then(async () => {
                                    let path = paths.shift() || "";

                                    for (let route of currentModule.routes) {
                                        if (route.path === path) {

                                            // // Load Module
                                            if (route.module !== null) {
                                                await _loadModules(`${directory}/${route.module}`, route.module, App.getModuleIndex(currentModule)).then(module => {
                                                    if (currentModule.loadSuccess === false)
                                                        currentModule.modulesInstance.push(module);
                                                    App.currentLoadingModule = currentModule;
                                                });
                                            }

                                        }
                                    }
                                });
                            }

                            // Load Component
                            for (let component of currentModule.components) {
                                let currentDirectory = directory;
                                if (moduleName !== component)
                                    currentDirectory += `/${component}`;

                                await appendScript(currentDirectory, 'component').then(async () => {
                                    let currentComponent = App.getComponentInstanceByPath(currentDirectory) || currentModule.getLastComponentInstance();
                                    currentComponent.moduleName = moduleName || 'app';
                                    if (currentComponent.path === undefined) {
                                        currentComponent.path = currentDirectory;
                                        let module = App.getModuleByName(currentComponent.moduleName);
                                        currentComponent.building(module);
                                    }
                                });
                            }
                            resolve();
                        })
                    })();
                } else {
                    if (currentModule.options.hasRoute) {
                        await appendScript(directory, 'route').then(async () => {
                            let path = paths.shift() || "";

                            for (let route of currentModule.routes) {
                                if (route.path === path) {

                                    // // Load Module
                                    if (route.module !== null) {
                                        await _loadModules(`${directory}/${route.module}`, route.module, App.getModuleIndex(currentModule)).then(module => {
                                            if (currentModule.loadSuccess === false)
                                                currentModule.modulesInstance.push(module);
                                            App.currentLoadingModule = currentModule;
                                        });
                                    }

                                }
                            }
                        });
                    }
                }

                currentModule.loadSuccess = true;
                return currentModule;
            })
        }

        return await _loadModules(directory, moduleName, parentModuleIndex);
    }

    static forward() {
        Route.updatePath();
        let paths = Route.paths;

        App.loadModules('./app').then(() => {
            let rootModule = App.modules[0];
            let loadModuleComponents = async function (module, directory, allowEmptyPath = false) {
                let path = paths.shift() || '';
                if (module.options.hasRoute) {
                    for (let route of module.routes) {
                        await (function () {
                            return new Promise(async resolve => {
                                if (route.path === path || (route.path === "" && allowEmptyPath)) {
                                    if (route.component === null) {
                                        // Load Module
                                        if (route.module !== null) {
                                            let subModule = App.getModuleByName(route.module);
                                            await loadModuleComponents(subModule, subModule.path, true);
                                            resolve();
                                        }
                                    } else {
                                        let componentPath = null;
                                        let routerOutletModule = null;

                                        if (module.name === route.component) {
                                            componentPath = directory;
                                            routerOutletModule = App.modules[module.parentIndex];
                                        } else {
                                            componentPath = `${directory}/${route.component}`;
                                            routerOutletModule = module;
                                        }

                                        let currentComponent = App.getComponentInstanceByPath(componentPath);
                                        let routerOutletMatch = false;

                                        for (let routerOutlet of routerOutletModule.routerOutlets) {
                                            if (routerOutlet.name == route.name) {
                                                routerOutletMatch = true;
                                                let element = document.createElement(currentComponent.selector);

                                                element.addEventListener('load', async function () {
                                                    // Load Module
                                                    if (route.module !== null) {
                                                        let subModule = App.getModuleByName(route.module);
                                                        await loadModuleComponents(subModule, subModule.path);
                                                    }
                                                    resolve();
                                                });

                                                routerOutlet.element.innerHTML = '';
                                                routerOutlet.element.appendChild(element);
                                            }
                                        }

                                        if (!routerOutletMatch) {
                                            throw new Error(`Module "${module.name}" route name "${route.name}" was not found.`)
                                        }
                                    }

                                } else {
                                    resolve();
                                }
                            })
                        })();
                    }
                }
            }

            loadModuleComponents(rootModule, rootModule.path);
        })
    }

    static getModuleIndex(module) {
        return App.modules.indexOf(module);
    }

    static getLastModule() {
        return App.modules.slice(-1)[0];
    }

    static getLastComponentInstance(module) {
        return module.componentsInstance.slice(-1)[0];
    }

    static getModule(name, directory) {
        return App.modules.find(module => [name, directory].includes(module.name));
    }

    static getModuleByDirectory(directory) {
        return App.modules.find(module => module.name === directory);
    }

    static getModuleByName(name) {
        return App.modules.find(module => module.name === name);
    }

    static getComponentInstanceByPath(path) {
        for (let module of App.modules) {
            for (let component of module.componentsInstance) {
                if (component.path === path) {
                    return component;
                }
            }
        }

        return null;
    }
}

appendScript('./core', 'classLoader')
    .then(() => ClassLoader.loader())
    .then(() => ENV.loader().then(Global.loader))
    .then(() => {
        return new Promise(resolve => {
            // first load app module.
            appendScript('app', 'module').then(() => {
                App.currentLoadingModule = App.getModule('app');
                App.currentLoadingModule.name = 'app';
                // first load app component.
                appendScript('app', 'component').then(() => {
                    let root = document.body.querySelector('app-root');
                    root.addEventListener('load', resolve);
                });
            });
        });
    }).then(() => App.loadModules('./app').then(App.forward))
    .then(() => {
        window.addEventListener("hashchange", App.forward);
    })