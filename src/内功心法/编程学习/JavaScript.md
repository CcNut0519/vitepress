# JavaScript

## 使用方法

要想执行一个 JavaScript 脚本，首先需要 [安装Node.js](https://nodejs.org/zh-cn)

键入以下命令执行一个 JavaScript 脚本文件：

```bash
node test.js
```

嵌入在HTML中的JavaScript必须在 `<script></script>` 中间，可放在 `body` 和 `head` 的任意位置，通常是放到 `head` 中或者页面底部，不干扰页面内容，数量不限

可以使用 `debugger` 语句来调试JavaScript代码，例如：

```js
debugger;
```

作用等同于断点

::: tip
如果使用外部的script文件，则在HTML中使用 `<script src="test.js"></script>` 来引用（外部脚本文件中不能包含 `<script>` 标签）
:::

## 在浏览器中调试

1. 打开浏览器，按`F12`进入开发者工具
2. 选择Console选项卡
3. 输入JavaScript代码，按`Enter`键执行

::: tip
或者进入source选项卡中新增Snippets，输入JavaScript代码，按 `Ctrl+Enter` 键执行, 如下图所示：
:::

![snippets中编写代码段](https://image-host.pages.dev/learn/2024_09_20_202409201343791.png)

## 输出语句

* `window.alert()`弹出警告框
* `document.write()`在页面中输出内容
* `console.log()`在控制台输出内容
* 修改`innerHTML`页面元素的内容，将内容显示在页面中，例如：

```js
 document.getElementById(id).innerHTML = newHTML;
```

::: tip
可以在文本字符串中使用 `\` 来进行换行
:::

## 语法

### 字面量

**固定的值被称为字面量**，例如：

* 数字字面量：`3.14、6、1e13`

* 字符串字面量：`“wow”、'WOW'`

* 表达式字面量：`1+2、2*3`

* 数组（Array）字面量：`[1,2,3,4,5]`

* 对象（Object）字面量：`{firstName:"John", lastName:"Doe", age:50, eyeColor:"blue"}`

* 函数（Function）字面量：`function plus(a, b) { return a + b;}`

### 变量

* 使用`var`关键字声明变量，例如：`var a = 114514;`

* `let`关键字则定义块级作用域的局部变量，常用于循环语句和条件语句中，例如：`let a = 114514;`

* `const`关键字定义常量，例如：`const a = 114514;`

### 注释

```js
//我不会执行
```

```js
/*
我也不会执行
*/
```

::: warning
**JavaScript对大小写敏感**

getElementById和getElementbyID不同，不同大小写的变量也是不同的
:::

### 模板字符串

模板字符串使用反引号`` ` ``括起，允许换行， `${a}` 输出变量 `a` ，也可以是表达式 `${1+1}` ，甚至函数 `${hello()}`

### 比较运算符

* `==`：相等
* `===`：绝对相等，类型和值都相等
* `!==`：绝对不相等，类型和值至少有一个不相等

### 条件语句

* `switch`语句中每个`case`末尾使用`break;`跳出以防进入随后的`case`
* 使用`default：`定义默认事件

### 循环

* `for`循环和`while`循环语法跟C++一致

* `for/in`循环可以遍历对象的属性：`for (x in object){}`

* `break;`直接跳出循环语句，`continue;`则是跳过当前迭代

## 数据类型

* `symbol`：ES6（ECMAScript 2015）引入的一种新的基本数据类型，用于表示独一无二的值，例如：`Symbol("description")`
* JavaScript具有动态类型，变量可以随时改变类型，例如：`var a = 114514; a = "114514";`
* 变量的数据类型使用`typeof`运算符来获取，例如：`typeof a;`
* 字符串中可以使用引号，但不要与字符串的引号匹配，可以使用 `\"`的形式转义或者使用不同的引号
* 对象类型：`var person={firstname:"John", lastname:"Doe", id:5566};`具有两种寻址方式：`person.firstname`和`person["firstname"]`
* 可以将变量值设置为null来清空值，赋值为undefined则会同时清空值和类型
* 声明变量可以使用`new`来声明固定类型的变量，例如：`var a = new Number(114514);`

![JS数据类型](https://image-host.pages.dev/learn/2024_09_20_202409201440825.png)

## 对象

使用函数构造对象：

```js
function Person(firstName, lastName, age, eyeColor) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.age = age;
    this.eyeColor = eyeColor;
}
var person = new Person("John", "Doe", 50, "blue");
```

对象中定义函数：

```js
out_a: function() {
    return this.a;
}
objectname.out_a();
```

::: warning
调用时不加括号会输出函数的代码
:::

## 函数

* 函数定义时参数为变量名，不用写变量类型
* 执行`return`语句后，函数会立即停止执行
* 把值赋给没有声明的变量时，该变量将自动作为`window`的一个属性，可以使用`delete + 变量名`直接删除（尽量不要）

* 函数可以在声明之前调用

* 函数表达式用括号包裹并在后面紧跟（）则为自调用函数，例如：`(function () {})();`

::: warning
已经声明的函数不能自调用
:::

* 箭头函数：`(参数1, 参数2,...) => { 函数体 }`，例如：`(a, b) => { return a + b; }`。如果只有一个参数可省略小括号，如果函数体只有一个语句则可以省略return和大括号

::: warning
使用前必须先声明，最好使用 `const` ，例如： `const add = (a, b) => a + b;`

:::

* `arguments`参数为隐式参数，用于获取函数的参数列表，例如：

```js
function add() {
    return arguments[0] + arguments[1];
}
```

* 函数内的变量作用域只在该函数中，但是如果在函数内没有用关键字声明，该变量则为全局变量，例如：

```js
function add() {
    a = 114514;
}
```

* 函数内部可以通过将局部变量赋值给window对象属性来使其全局可见，window属性调用时可省略window对象名，例如：`window.a = 114514;`

## HTML事件

HTML事件能够触发JavaScript方法，例如：

```html
<button onclick="alert('Hello World!')">点击我</button>
```

::: info
常见的HTML事件：

* `onchange`：HTML元素改变

* `onclick`：用户点击HTML元素

* `onmouseover`：鼠标指针移动到指定的元素时发生

* `onkeydown`：用户按下键盘按键

* `onload`：浏览器已完成页面的加载
:::

## 字符串

* 可以使用索引位置来访问字符串中的任意字符：`carname[6]`

* 可以使用 `+` 号将字符串拼接，如果是字符串加数字则数字将自动转换成字符串

* 可以使用内置属性`length`来计算字符串长度：`carname.lenth`

* `var x = ''John'";`创建的是`String`类型，`var y = new String ("John");`创建的是`Object`类型

::: tip
`String` 类型会拖慢执行且可能产生副作用
:::

## 代码块

* 使用`labelname:{}`标注代码块
* 使用`break labelname;`跳出代码块

## 类型转换

* 字符串转数字：`Number("114514")`

* 数字转字符串：`String(114514)`或者`num.toString()`

## 正则表达式

`String` 类型中 `Search()` 方法可以使用正则表达式： `str.search(/World/i);` 其中 `World` 是搜索的字符串， `i` 是不区分大小写

`String` 类型中 `replace()` 方法也可以用正则表达式实现字符替换

正则表达式修饰符：

* `i`：不区分大小写
* `g`：遇到第一个匹配不停止，继续向后匹配
* `m`：多行匹配
* 方括号`[]`表示查找方括号内任意字符：`[abc]`、`[0-9]`
* 元字符：`\d`数字、`\s`空白字符、`\b`单词边界
* `n+`匹配包含至少1个n的字符串，`n*`匹配包含0个以上n的字符串、`n?`匹配包含0个或1个n的字符串
* `test()`是一个模式匹配的正则表达式方法：`patt.test("str");`其中`patt`是正则表达式模式，`str`是待测字符串，返回值为`boolean`
* `exec()`和`test()`不同点是`exec()`查找成功输出的是模式匹配的字符串，失败则输出`null`

## 错误检测

* `try`定义进行错误检测的代码块
* `catch`语句在try定义的代码块中发生错误时执行
* `finally`语句不论是否发生错误都执行

例如：

```js
try {
    // 可能会发生错误的代码
} catch (err) {
    // 错误处理代码
} finally {
    // 无论是否发生错误，都会执行的代码
}
```

::: tip
可以在 `try` 中使用 `throw "str"` 来自定义错误输出， `catch(err){}` 中的 `err` 参数即为错误输出
:::

## 变量提升

JavaScript中变量可以先使用后声明，声明将会被解释器提升到最代码顶处，称作声明提升, 例如：

```js
a = 114514;
var a;
```

::: warning
只能提升声明但不能提升定义，比如前面的语句使用了变量x，后面才初始化：var x = 6; 则只会提升var x; 
:::

## 严格模式

`"use strict";` 语句消除代码的不安全之处，减少语法错误，提高了运行效率，为未来版本的JavaScript做铺垫，放在脚本开头的作用域则是全局，放在函数中则是局部作用

## 注意事项

* JavaScript采用IEEE 754标准，为64位浮点数，如果`x = 0.1; y = 0.2; z = x + y;` 此时`z == 0.3` 为假。因为JavaScript中所有数据使用64位浮点数存储，所以此时`z = 0.30000000000000004`

::: tip
为了解决上面问题可以先将小数提升为整数再做除法，例如： `z = (x * 10 + y * 10) / 10;`

:::

* JavaScript语句可以没有分号，如果一行的语句不完整则会自动读取下一行
* 数组可以使用名字作为索引，`var person = []; person["firstName"] = "John";`
* 定义对象和数组元素时最后不能添加逗号`，否则会报错

## 表单

表单例子: `document.forms["myForm"]["email"]`

* 浏览器自动验证表单是否为空通过`required`属性来设置，例如：`<input type="text" name="email" required>`
* `x.indexOf("@");` 返回 `x` 字符串中`@`第一次出现的位置
* `x.lastIndexOf(".");` 返回 `x` 字符串中`.`最后一次出现的位置

## this关键字

* `this` 表示调用它所在方法的对象

* 单独使用或全局函数中使用则 `this` 指向 `window` 对象, 注意严格模式下函数中的 `this` 不会自动指向 `window` 而是`undefined`

* HTML事件中 `this` 指向当前HTML元素

* A对象使用函数时添加`.call(B)`可以使用B对象的属性，例如：

```js
var A = {
    name: "A",
    sayName: function() {
        console.log(this.name);
    }
};

var B = {
    name: "B"
};

A.sayName.call(B); // 输出"B"
```

## 常量

常量在定义对象类型的时候，不能直接修改对象的值，但可以修改对象每个属性的值，如下：

```js
const person = {
    name: "John",
    age: 25
};

person.age = 30; // 正确
person = {
    name: "Mary",
    age: 35
}; // 错误
```

* 在不同级的块中`const`可以重新赋值变量

::: warning
`const` 不能在使用后声明
:::

## JSON

JSON是独立的语言，使用JavaScript语法，它常用于服务端和客户端的数据交换

::: tip
`JSON.parse()` 可以将JSON字符串转换为JavaScript对象
:::

## 异步编程

* 延迟执行函数：`setTimeout(function,3000);` 这个函数执行时会产生一个延迟3秒的子线程

* **AJAX**就是一种在网页中实现异步通信的技术

* `XMLHttpRequest（）`常用于请求远程服务器上的XML或JSON数据

`Promise` 对象可以简化异步编程，它将嵌套式的瀑布流代码变成顺序格式的代码

`Promise` 类有 `.then()`  `.catch()` 和 `.finally()` 三个方法， `then()` 是正常执行序列， `catch()` 当异常时执行， `finally()` 最后一定执行

`Promise` 对象代表一个异步操作，有三种状态：Pending（进行中）、Resolved（已完成，又称 Fulfilled）和 Rejected（已失败）

`Async/await` 是基于 `Promise` 的语法糖，例如：

```js
async function fetchData() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.log(error);
    }
}

fetchData();
```

## 代码规范

* 运算符前后空格隔开，例如：`var a = 1 + 2;` `var car_name = ["Volvo", "Saab", "Fiat"];`
* 使用四个空格缩进代码块，因为不同编辑器对Tab的解析不同
* 短的对象直接写成一行，不超过80个字符
* 文件名全部小写

## 内嵌函数

当想隐藏全局变量却又不想外面的方法可以随意访问变量时，在一级函数中定义变量，再由二级函数访问变量，这样对于二级函数这个变量就相当于全局变量了

## 类

### 定义类

* 类`class`是对象`Object`的模板

* 为了能够更规范的更方便地定义对象

* 通过构造函数`constructor()`定义属性示例如下：

```js
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
}
const person1 = new Person("John", 25);
```

* 静态方法是属于类的，通过对象调用会出错

### 类的继承

* 类的继承使用 `class A extends B` 语法，这是ES6标准，基于原型链继承的语法糖，子类的构造函数中使用`super();`引用父类的构造函数，例如：

```js
class Animal {
    constructor(name) {
        this.name = name;
    }
    speak() {
        console.log(`${this.name} makes a noise.`);
    }
}

class Dog extends Animal {
    constructor(name, breed) {
        super(name);
        this.breed = breed;
    }
    speak() {
        console.log(`${this.name} barks.`);
    }
}

const myDog = new Dog("Rufus", "Labrador");
myDog.speak(); // "Rufus barks."
```

* getter和setter可以方便访问类的属性值，在同名的函数前使用`get`/`set`关键字即可实现重载

::: warning
须在严格模式下使用
:::

开发者习惯在属性前加上下划线_将其与getter和setter区分开，例如：

``` js    
class Person {

    constructor(name, age) {
        this._name = name;
        this._age = age;
    }
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }
    get age() {
        return this._age;
    }
    set age(value) {
        this._age = value;
    }

}
