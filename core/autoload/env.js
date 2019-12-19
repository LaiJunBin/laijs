class ENV {
    static async loader() {
        return fetch('lai.json').then(res => res.json()).then(res => {
            Object.assign(ENV, res);
        });
    }
}