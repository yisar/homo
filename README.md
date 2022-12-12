# Homo
> Lightweight Rendering engine similar to Harmony, but use Fre and quickjs

*It also called Fre native!*

- Javascript Runtime with [Zig](https://github.com/ziglang/zig) and [quickjs](https://github.com/bellard/quickjs)
- UI framework use [Fre.js](https://github.com/frejs/fre)
- Event loop and Event bubbling
- DOM diff and Flex layout alghrithom
- cross-compilation with Zig

### Usage

```js
import { render, useState } from "fre"

function App() {
    const [count, setCount] = useState(0)
    const add = () => {
        console.log('u clicked a button')
        setCount(count + 1)
    }
    return (
        <view style={{ height: 100, width: 100 }} onClick={add}>
            {count}
        </view>
    )
}
render(<App />, document.body)
```

### Run demo

```js
zig build
 ./zig-out/bin/fre.exe dist/app.js  
```
![DEMO](https://ttfou.com/images/2022/12/12/185805cbd07ce81705e287ea45a09cb8.png)

### 说人话

这是一个小型渲染引擎，它和鸿蒙、flutter等拥有类似的架构，只不过使用 quickjs 和 fre 而已

这也是我的一个承诺