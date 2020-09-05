---
title: 深浅拷贝
---

<a name="lWdT6"></a>
# javaScript的变量类型
（1）基本类型：<br />5种基本数据类型undefined、null、Boolean、Number、String、Symbol，变量是直接存放值的，存放在栈内存中的简单数据段，可以直接访问。<br />（2）引用类型：<br />存放在堆内存中的对象，在栈内存中变量保存的是一个指针，这个指针指向堆内存中对应数据的地址。当需要访问引用类型（如对象，数组等）的值时，首先从栈中获得该对象的地址指针，然后再从堆内存中取得所需的数据。

JavaScript存储对象都是存地址的引用类型，所以浅拷贝会导致 obj1 和obj2 指向同一块内存地址。改变了其中一方的内容，都是在原来的内存上做修改会导致拷贝对象和源对象都发生改变。<br />而深拷贝是开辟一块新的内存地址，将原对象的各个属性逐个复制进去。对拷贝对象和源对象各自的操作互不影响。<br />

<a name="Qf8B3"></a>
# 赋值、浅拷贝、深拷贝
深拷贝：将 B 对象拷贝到 A 对象中，包括 B 里面的子对象，<br />浅拷贝：将 B 对象拷贝到 A 对象中，但不包括 B 里面的子对象

|  | 和原数据是否指向同一对象 | 第一层数据为基本数据类型 | 原数据中包含子对象 |
| --- | --- | --- | --- |
| 赋值 | 是 | 改变会使原数据一同改变 | 改变会使原数据一同改变 |
| 浅拷贝 | 否 | 改变不会使原数据一同改变 | 改变会使原数据一同改变 |
| 深拷贝 | 否 | 改变不会使原数据一同改变 | 改变不会使原数据一同改变 |



<a name="0Iy9B"></a>
# 赋值
```javascript
const obj1 = {a:0};
const obj2 = obj1;

obj1 === obj2 // true
```

<br />

<a name="nSlWC"></a>
# 浅拷贝
拷贝原对象的实例，但是对其内部的引用类型值，拷贝的是其引用，常用的就是如

- jquey中的$.extend({}, obj); 
- Array.prototype.slice()
- Array.prototype.concat()
- Object.assign()
- 扩展运算符{ ...obj }、[ ...arr ]

都会返回一个数组或者对象的浅拷贝
```javascript
// 浅拷贝，双向改变,指向同一片内存空间
var arr1 = [{a:0}, 2, 3];
var arr2 = {...arr1};

arr1 == arr2 // false
arr1 === arr2 // false

arr1[0] == arr2[0] // true
arr1[0] === arr2[0] // true
```


```javascript
function clone(arr){
  var arr = [];
	for(var i = 0; i < arr1.length; i++){
    	arr.push(arr1[i]);
  }
  return arr;
}

var arr1 = [{ a: 0 }, 1, 2];
var arr2 = clone(arr1);

arr1 == arr2 // false
arr1 === arr2 // false

arr1[0] == arr2[0] // true
arr1[0] === arr2[0] // true
```

<br />`Object.assign()` 只对顶层属性做了赋值，完全没有继续做递归之类的把所有下一层的属性做深拷贝。只是一级属性复制。
```jsx
var obj = {a:{aa:{aaa:1}}}
var obj1 = Object.assign({},obj);
obj == obj1 // false
obj.a == obj1.a // true

var obj = {a:{aa:{aaa:1}}}
var obj1 = Object.assign({},obj);
obj.a === obj1.a // true
```

<br /> slice()
```jsx
var array = [{a:100}, 2, 3, 4];
var copyArray = array.slice();
array[0] == copyArray[0]
true
```

<br />concat
```jsx
var array = [{a:1}, 2, 3, 4];
var copyArray = array.concat();
array[0] == copyArray[0]
true
```

<br />

```javascript
function shallowClone(source) {
  var target = {};
  for(var i in source) {
    if (source.hasOwnProperty(i)) {
      target[i] = source[i];
    }
  }

  return target;
}
```

<br />

<a name="e8fk7"></a>
# 深拷贝


```javascript
/**
 * 生成测试需要的数据
 */
function createData(deep, breadth) {
  var data = {};
  var temp = data;

  for (var i = 0; i < deep; i++) {
    temp = temp['data'] = {};
    for (var j = 0; j < breadth; j++) {
      temp[j] = j;
    }
  }

  return data;
}
```

<br />测试用例
```javascript
var testObj = {
  num: 10,
  str: 'str',
  arr: [
    10,
    {
      arrObjA:10,
    },
  ],
  sy:Symbol(''),
  da:new Date(),
  fn:function(){},
  reg: /test/,
};
```


<a name="HeNtB"></a>
## JSON.stringify() 和 JSON.parse() 
1.无法实现对 函数、RegExp、Date等 特殊对象的克隆<br />2.会抛弃对象的constructor,所有的构造函数会指向Object<br />3.对象有循环引用,会报错
```jsx
var obj1 = {
  name: 'wayne', 
  age: 22,
  other: {
    hobby: 'table',
    school: 'xjtu'
  }
}
var obj2 = JSON.parse(JSON.stringify(obj1));
obj2.name = 'hedy'
console.log(obj1.name) // wayne
obj2.other.hobby = 'sing'
console.log(obj1.other.hobby) // table
```

<br />可以看出通过JSON.stringify先将对象转化为字符换，然后再通过JSON.parse()转化为对象，这个对象就是完全在开辟的新的内存空间中的对象 。

<a name="bmuov"></a>
## 递归
简版
```javascript
/**
 * 深拷贝
 * @param {any} obj
 * 其中：function、symbol直接返回了原来的值;
 * 循环引用会报错
 * 数据深度过大会存在爆栈
 */
function deepClone(obj) {
  // 判断类型，根据不同类型进行处理
  if(obj === null){
    return null;
  }
  if(typeof obj !== 'object'){
    return obj;
  }
  if(obj instanceof RegExp) {
    return new RegExp(obj)
  }
  if(obj instanceof Date) {
    return new Date(obj)
  }

  // 不直接创建空对象目的是，克隆的结果和之前保持相同的所属类
  let newObj = new obj.constructor(); // 为了防止obj是个实例
  for(let key in obj) {
    // 递归克隆
    newObj[key] = deepClone(obj[key]);
  }
  return newObj;
}
```


```javascript
/**
 * 深拷贝
 * @param {any} obj
 * 其中：function、symbol直接返回了原来的值;
 * 数据深度过大会存在爆栈
 */
function deepClone(obj, parent) {
    var _parent = parent;
    var objType = getType(obj);
    var newObj = {};

    if (objType !== 'object' && objType !== 'array') {
        return obj;
    }

    // 该字段有父级则需要追溯该字段的父级，判断是否为循环引用
    while (_parent) {
        // 如果该字段引用了它的父级，则为循环引用
        if (_parent.originParent === obj) {
            // 循环引用返回同级的新对象
            return _parent.currentParent;
        }
        // 向上追溯父级
        _parent = _parent.parent
    }

    if (objType === 'array') {
        newObj = [];
    }
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            var item = obj[key];
            var itemType = getType(item);
            if (itemType === 'object' || itemType === 'array') {
                newObj[key] = deepClone(item, {
                    // 递归执行深拷贝，将同级的待拷贝对象与新对象传递给parent，方便追溯循环引用
                    // 源对象父级，用于判断是否引用了他的父级
                    originParent: obj,
                    // 新的对象父级，用于存在循环引用时的返回值
                    currentParent: newObj,
                    // 父级对象，按照层级存放所有的源对象父级
                    parent: parent
                });
            } else if (itemType === 'date') {
                newObj[key] = new Date(item);
            } else if (itemType === 'regexp') {
                newObj[key] = new RegExp(item);
            } else if (itemType === 'function') {
                // TODO:
                newObj[key] = item;
            } else if (itemType === 'symbol') {
                // TODO:
                newObj[key] = item;
            } else {
                newObj[key] = item;
            }
        }
    }
    return newObj;
}

/**
 * 判断数据的类型
 * @param {any} obj
 */
function getType(obj) {
    return Object.prototype.toString.call(obj).replace(/^\[object (.+)\]$/, '$1').toLowerCase();
}
```


<a name="tfKAd"></a>
## 循环
```javascript
/**
 * 深拷贝
 * @param obj 需要深拷贝的对象
 * 使用循环模拟栈，防止数据深度过大导致爆栈;
 */
function deepClone(obj) {
    // 用来去重
    var uniqueList = [];

    // 设置最外层的根对象
    var root = {};
    if (getType(obj) === 'array') {
        root = [];
    }

    // 栈
    var loopList = [
        {
            parent: root,
            // 存储data在父级对应的key
            key: undefined,
          	// 当前要处理的数据
            data: obj,
        }
    ];

    while (loopList.length) {
        var node = loopList.pop();
        var parent = node.parent;
        var key = node.key;
        var data = node.data;

        // 初始化赋值目标，key为 undefined 则拷贝到父元素，否则拷贝到子元素
        var res = parent;
        if (typeof key !== 'undefined') {
            if (getType(data) === 'array') {
                res = parent[key] = [];
            } else {
                res = parent[key] = {};
            }
        }

        // 数据已经存在
        var uniqueData = getItemFromArr(uniqueList, data);
        if (uniqueData) {
            parent[key] = uniqueData.target;
            break; // 中断本次循环
        }

        // 数据不存在
        // 保存源数据，在拷贝数据中对应的引用
        uniqueList.push({
            source: data,
            target: res,
        });

        // 广度优先 处理
        // 遍历当前对象的子项(只遍历第一层，如果子项的值是对象，则保存到栈里面)
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                var item = data[key];
                var itemType = getType(item);
                switch (itemType) {
                    // 对象和数组进行 下一次循环
                    case 'object':
                    case 'array':
                        loopList.push({
                            parent: res,
                            key: key,
                            data: item,
                        });
                        break;
                    case 'date':
                        res[key] = new Date(item);
                        break;
                    case 'regexp':
                        res[key] = new RegExp(item);
                        break;
                    case 'function':
                        // TODO:
                        res[key] = item;
                        break;
                    case 'symbol':
                        // TODO:
                        res[key] = item;
                        break;
                    default:
                        res[key] = item;
                }
            }
        }
    }

    return root;
}

/**
 * 从数组里面获取数据
 * @param {Array} arr 
 * @param {any} item 
 */
function getItemFromArr(arr, item) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].source === item) {
            return arr[i];
        }
    }
    return null;
}

/**
 * 判断数据的类型
 * @param {any} obj
 */
function getType(obj) {
    return Object.prototype.toString.call(obj).replace(/^\[object (.+)\]$/, '$1').toLowerCase();
}
```

<br />

<a name="jakET"></a>
## 测试
```javascript
// 测试

function createData(deep, breadth) {
    var data = {};
    var temp = data;

    for (var i = 0; i < deep; i++) {
        temp = temp['data'] = {};
        for (var j = 0; j < breadth; j++) {
            temp[j] = j;
        }
    }

    return data;
}

function testDeepClone(obj) {
    return cloneLoop(obj);
    // return deepClone(obj);
}

var arr1 = [
    0,
    { a: { aa: { aaa: {} } } },
    new Date('2019/1/2 3:4:5'),
    /1/g,
    function a() { console.log(this, 'function'); return 'a'; },
    () => { console.log(this, '()=>{}'); return '()'; },
    Symbol(10),
    [1, 2, { a: 3 }]
];
var arr2 = testDeepClone(arr1);

console.log(arr2);
for (var i = 0; i < arr1.length; i++) {
    console.log(i, arr1[i], getType(arr1[i]), getType(arr2[i]), arr1[i] == arr2[i]);
}
console.log(arr2[4]);
console.log(arr1[4](), arr2[4](), arr1[4] == arr2[4]);
console.log(arr1[5]);
console.log(arr2[5]);
console.log(arr1[5](), arr2[5](), arr1[5] == arr2[5]);
console.log(arr1[7][2] == arr2[7][2]);


var a = {}
var b = {}
a['b'] = b
b['a'] = a
var c = testDeepClone(a);
console.log('a', a, 'b', b, 'c', c);
console.log(c.b.a, a.b.a, c.b.a === a.b.a);

// 父级引用
/**
 * 父级引用指的是，当对象的某个属性，正是这个对象本身，此时我们如果进行深拷贝，可能会在子元素->父对象->子元素...这个循环中一直进行，导致栈溢出。
 */

var obj1 = {
    x: 1,
    y: 2
};
obj1.z = obj1;

var obj2 = testDeepClone(obj1); // 栈溢出
console.log(obj2);
console.log(obj2.z.z === obj1.z.z);

/**
 * 同级引用
 * 假设对象obj有a,b,c三个子对象，其中子对象c中有个属性d引用了对象obj下面的子对象a。
 */
var obj3 = {
    a: {
        name: {}
    },
    b: {
        name: {}
    },
    c: {

    }
};
obj3.c.e = obj3.a;
var obj4 = testDeepClone(obj3);
console.log(obj4, obj4.c.e.name === obj3.c.e.name);


var obj5 = {
    aa: {
        aaa: {
            n: 1
        }
    },
    ab: {
        abb: {
            n: 2
        },
        abc: {
            n: 3
        }
    }
}

obj5.ab.abc = obj5.aa.aaa;
obj5.aa.aaa = obj5.ab.abb;
var obj6 = testDeepClone(obj5);
console.log(obj6);

console.log(testDeepClone(createData(10000))); // Maximum call stack size exceeded

```


