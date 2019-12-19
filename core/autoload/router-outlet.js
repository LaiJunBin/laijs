class RouterOutlet {
    constructor(element) {
        this.element = element;
        this.name = element.getAttribute('name') || null;
    }

    static building(module, element) {
        module.routerOutlets.push(new RouterOutlet(element));
    }

}

customElements.define('router-outlet', class extends HTMLElement {
    constructor() {
        super();
    }
});