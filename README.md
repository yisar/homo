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

### 说人话

