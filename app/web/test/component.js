Component.create({
    selector: 'app-web-test',
    template: 'index.html',
    styles: ['style.css']
})(class {
    constructor() {

    }

    alert() {
        Alert.showMessage('test!');
    }
});