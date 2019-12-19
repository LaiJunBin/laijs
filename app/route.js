Route.create([{
    // 可以指定路徑、模組、元件
    path: '/home',
    module: 'home',
    component: 'home'
}, {
    // 也可以只指定路徑與元件
    path: '',
    // 可以直接跨越模組使用元件
    component: 'home/test'
}, {
    // 可以只指定路徑與模組，但子模組需啟用route功能
    path: '/web',
    module: 'web'
}])