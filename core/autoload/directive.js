class Directive {

    constructor(action) {
        this.action = action;
    }

    static directiveNames = [
        'for',
        'href'
    ];

    static directives = {};

    static loader() {
        let uri = './core/autoload/directives';

        return Promise.all(Directive.directiveNames.map(script => appendScript(uri, script)));
    }

    static create(directive, action) {
        Directive.directives[directive] = new Directive(action);
    }

    static getInstance(directive) {
        return Directive.directives[directive] || null;
    }

}

Directive.loader();