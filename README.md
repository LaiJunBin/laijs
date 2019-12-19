`Not completed - 2019/12/20`

# Lai JS (Front-End Framework)

> Demo： [點我前往Demo](https://laijunbin.github.io/laijs)

## 基本檔案結構
```
   |
   |___<app>
   |     |___ <module.js>
   |     |___ <component.js>
   |     |___ <route.js>
   |     |___ <style.css>
   |     |___ <index.html>
   |     |___ <subModule Or subComponent Folder..>
   |
   |___<index.html>
   |
   |___<global.css>
   |
   |___<lai.json>
```

---

## 說明

app資料夾中存在模組或元件的資料夾，而每個資料夾可以包含以下檔案：

* module.js
* component.js(*)
* route.js
* style.css
* index.html(*)
* 子模組或子元件的資料夾...

其中(*)代表是必須存在的檔案

## 根目錄的檔案說明

index.html： 首頁

global.css： 預設的全域CSS檔案。

lai.json： 設定檔，目前可以設定全域要引入的JS與CSS地址。

## 模組(元件)資料夾檔案範例

### module.js
```js
Module.export({
    components: [
        // 宣告此模組使用到的元件
        'header',
        'home/test'
    ],

    options: {
        // 若此模組存在路由需設定為true
        hasRoute: true
    }
});
```

### component.js
```js
Component.create({
    // 宣告此元件使用的Tag
    selector: 'app-home',
    // 宣告此元件使用的模板文件
    template: 'index.html',
    // 宣告此元件使用到的css文件
    styles: ['style.css']
})(class {

    constructor() {
        // 在這裡可以宣告變數(模板文件可以使用)
        this.text = 'Hello World!!!';
        this.item1 = [1, 2, 3, 4];
        this.item2 = ['a', 'b', 'c'];
    }

    // 處理方法
    hello(e) {
        console.log(e);
    }
});
```

### route.js

```js
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
},{
    path: '/test',
    component: 'test',
    // 可以指定要放在哪個router-outlet
    name: 'a'
}])
```

### style.css

就..原來的css文件。

### index.html


# 標籤：

## 元件標籤
可以使用元件的Tag來插入元件，Ex: `<app-header></app-header>`

## `<router-outlet>`

此標籤會動態存入路由對應到的component

* property
    * name: 給標籤取名，對應到route.js的name

## 模板語法

* 使用 {{  }} 包住要輸出的變數
* 使用 *for 做迴圈
* 使用 *href 設定連結 (僅能使用在`<a>`標籤)
* 使用 () 處理事件， Ex: (click)="hello()"

Example:

item1與item2應宣告在component.js的constructor中。

```html
<ul>
    <li *for="i of item1">
        {{ i }}
        <ul>
            <li *for="j of item2" (click)="hello(i,j)">
                {{ j }}
            </li>
        </ul>
    </li>
</ul>
```

