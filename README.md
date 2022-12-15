# Homo
> Lightweight Rendering engine similar to Harmony, but use Fre and quickjs

*It also called Fre native!*

- Javascript Runtime with [Zig](https://github.com/ziglang/zig) and [quickjs](https://github.com/bellard/quickjs)
- UI framework use [Fre.js](https://github.com/frejs/fre)
- Graphics Library use [LVGL](https://github.com/lvgl/lvgl)
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

Homo 是一个小型渲染引擎，它和鸿蒙、flutter等拥有类似的架构，只不过使用 quickjs 和 fre 而已

它甚至完整演示了浏览器的运行过程，包括 `eval fre code => dom diff => flex layout => event loop => event bubbling`

和鸿蒙不同的是，Homo 更贴近 web 子集，而且 homo 的编译链路非常流畅，zig 交叉编译quickjs，特别适合前端er 学习研究

另外，homo 未来如果要上生产，嵌入式是一个研究方向，手表，手环等，fre 拥有最小的尺寸

虽然理论上它仍然可以交叉编译到安卓，但是我建议大家还是使用 flutter，因为 flutter 的完成度是个奇迹

另外一个方向是，我会研究将 homo 编译到 ue 和 unity，但那就是另外一个故事了

总之大家，这是我在前端的最后一个开源坑了，来年其他领域再贱