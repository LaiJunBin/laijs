class Global {
    static scripts
    static styles

    static async loader() {
        Global.scripts = ENV.global.scripts;
        Global.styles = ENV.global.styles;

        // Load global scripts
        for (let scriptUrl of Global.scripts) {
            await appendScript(url(scriptUrl));
        }

        // Load global styles
        for (let styleUrl of Global.styles) {
            let link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = styleUrl;
            document.head.appendChild(link);
        }
    }

}