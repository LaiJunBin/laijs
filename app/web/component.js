Component.create({
    selector: 'app-web',
    template: 'index.html',
    styles: ['style.css']
})(class {

    constructor() {
        this.text = 'Hello World!!!';

        this.item1 = [1, 2, 3, 4];
        this.item2 = ['a', 'b', 'c'];
    }

    homeClick(a, b) {
        console.log('click!', a + b)
    }

    over(e) {
        console.log(e);
    }

    hello(e, i, j) {
        console.log(e);
        console.log('hello', i, j);
    }
});