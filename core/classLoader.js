class ClassLoader {

    static async loader() {
        let uri = './core/autoload';
        let scripts = [
            'env',
            'global',
            'route',
            'router-outlet',
            'module',
            'component',
            'directive'
        ];

        return Promise.all(scripts.map(script => appendScript(uri, script)));
    }

}