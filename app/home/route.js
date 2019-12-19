Route.create(
    [{
        path: '/test',
        component: 'test',
        // 可以指定要放在哪個router-outlet
        name: 'a'
    }, {
        path: '/test2',
        component: 'test',
        name: 'b'
    }]
);