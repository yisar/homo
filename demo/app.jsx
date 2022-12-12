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
