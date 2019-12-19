Component.create({
    selector: 'app-test',
    template: 'index.html',
    styles: ['style.css']
})(class {
    constructor() {

    }

    alert() {
        Alert.showMessage('test!');
    }
});