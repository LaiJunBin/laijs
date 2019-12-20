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
            let style = document.createElement('style');
            let styleText = await fetch(url(styleUrl)).then(res => res.text());
            style.append(styleText);
            App.styles[styleUrl] = style;
            document.head.appendChild(style);
        }
    }

}