class Component {

    constructor() {
        this.selector = null;
        this.template = null;
        this.styles = null;
    }

    static create(params) {
        let component = new Component();
        for (let key in params) {
            if (component[key] === undefined)
                throw new Error(`Component create error! unknow key: ${key}`)

            component[key] = params[key];
        }

        let nullField = Object.keys(component).find(x => component[x] === null);
        if (nullField !== undefined)
            throw new Error(`Create component key: "${nullField}" can't be null.`);

        if (App.currentLoadingModule !== null) {
            if (App.currentLoadingModule.name === 'app' && App.currentLoadingModule.loadSuccess === undefined) {
                // root component
                component.moduleName = 'app';
                component.path = './app';
                component.building(App.currentLoadingModule);
            } else {
                App.currentLoadingModule.componentsInstance.push(component);
            }
        }

        return service => component.service = service;
    }

    building(module) {
        let component = this;

        if (customElements.get(component.selector) === undefined)
            customElements.define(component.selector, class extends HTMLElement {
                constructor() {
                    super();
                }

                connectedCallback() {

                    const shadow = this.attachShadow({
                        mode: 'open'
                    });

                    let parserComponent = () => {
                        let parserRegExp = new RegExp('\{\{(.*)\}\}', 'g');
                        let instance = null;
                        let deleteNodes = [];
                        if (component.service) {
                            instance = new component.service(shadow);
                            instance.nodes = [{
                                variables: {}
                            }];
                        }

                        let dfs = function (node) {

                            if (node.tagName === 'ROUTER-OUTLET' && component.loadSuccess === undefined) {
                                RouterOutlet.building(module, node);
                            }

                            if (node.getAttributeNames) {
                                for (let key of node.getAttributeNames()) {
                                    let value = node.getAttribute(key);
                                    let nodeHTML = node.outerHTML;

                                    // directive
                                    if (key.startsWith('*')) {
                                        let directive = key.substring(1);
                                        let directiveInstance = Directive.getInstance(directive);
                                        if (directiveInstance === null)
                                            throw new Error(`${nodeHTML} Directive error! unknow directive: ${key}`);

                                        node.removeAttribute(key);
                                        directiveInstance.action({
                                            'parent': node.parentNode,
                                            node,
                                            instance,
                                            value,
                                            deleteNodes
                                        });
                                    }

                                    // event

                                    let getNodeVariable = function (instance, index, key) {
                                        if (index == -1 || index === undefined)
                                            return null;

                                        if (instance.nodes[index].variables[key] !== undefined)
                                            return instance.nodes[index].variables[key]

                                        return getNodeVariable(instance, instance.nodes[index].parentIndex, key);
                                    }

                                    if (key.startsWith('(') && key.endsWith(')')) {
                                        let event = key.substring(1, key.length - 1);
                                        let functionName = value.split('(')[0];
                                        let params = value.substring(value.indexOf('(') + 1, value.length - 1).split(',').map(x => x.trim()).filter(x => x != "");
                                        let index = node.dataset.no || 0;
                                        params = params.map(param => getNodeVariable(instance, index, param) || instance[param] || param);

                                        node.addEventListener(event, function (e) {
                                            let func = instance[functionName];
                                            if (func === undefined)
                                                throw new Error(`${nodeHTML} ${functionName} is undefined.`)

                                            if (func.length === params.length) {
                                                instance[functionName].apply(this, params);
                                            } else if (func.length > params.length) {
                                                instance[functionName].apply(this, [e, ...params]);
                                            } else {
                                                throw new Error(`${nodeHTML} Event: ${event} ${value} params length error!`);
                                            }
                                        })

                                        node.removeAttribute(key);
                                    }

                                    // parser {{  }}
                                    let textNodes = Array.from(node.childNodes).filter(x => x.nodeType == Node.TEXT_NODE);
                                    for (let textNode of textNodes) {
                                        let matches = Array.from(textNode.textContent.matchAll(parserRegExp));
                                        for (let i = 0; i < matches.length; i++) {
                                            if (instance[matches[i][1].trim()] !== undefined)
                                                textNode.textContent = textNode.textContent.replace(matches[i][0], instance[matches[i][1].trim()]);
                                        }
                                    }

                                    // one way data binding
                                    // if (key.startsWith('[') && key.endsWith(']')) {

                                    // }


                                    // two way data binding
                                }
                            }
                            for (let child of node.children) {
                                dfs(child);
                            }

                            if (node.removeAttribute)
                                node.removeAttribute('data-no');
                        }

                        dfs(shadow);
                        deleteNodes.map(node => {
                            let index = +node.dataset.no;
                            let deleteNodeByParentIndex = function (index) {
                                for (let i = 1; i < instance.nodes.length; i++) {
                                    if (instance.nodes[i].parentIndex === index) {
                                        deleteNodeByParentIndex(i);
                                        instance.nodes.splice(i, 1);
                                    }
                                }
                            }
                            deleteNodeByParentIndex(index);
                            node.remove();
                            instance.nodes.splice(index, 1);
                        });

                        // check {{ }} exists, if exists throw errors.
                        let matches = Array.from(shadow.textContent.matchAll(parserRegExp));

                        let errors = [];
                        for (let match of matches) {
                            errors.push(new Error(`unknow: ${match[0]}`));
                        }
                        if (errors.length > 0)
                            throw errors;

                        component.loadSuccess = true;
                    }

                    if (component.templateHTML === undefined) {
                        fetch(`${component.path}/${component.template}`)
                            .then(res => res.text())
                            .then(res => shadow.innerHTML = res)
                            .then(async () => {
                                // Load global styles
                                for (let styleUrl of Global.styles) {
                                    shadow.appendChild(App.styles[styleUrl].cloneNode(true));
                                }

                                // Load component styles
                                for (let styleUrl of component.styles) {
                                    let style = document.createElement('style');
                                    let styleText = await fetch(`${component.path}/${styleUrl}`).then(res => res.text());
                                    style.append(styleText);
                                    shadow.appendChild(style);
                                }
                            }).then(() => {
                                component.templateHTML = shadow.innerHTML;
                                parserComponent();
                                this.dispatchEvent(new Event('load'));
                            });
                    } else {
                        shadow.innerHTML = component.templateHTML;

                        let routerOutlets = shadow.querySelectorAll('router-outlet');
                        for (let routerOutlet of routerOutlets) {
                            let name = routerOutlet.getAttribute('name') || null;
                            for (let moduleRouterOutlet of module.routerOutlets) {
                                if (moduleRouterOutlet.name === name) {
                                    moduleRouterOutlet.element = routerOutlet;
                                }
                            }
                        }

                        parserComponent();

                        this.dispatchEvent(new Event('load'));
                    }
                }
            });

    }

}