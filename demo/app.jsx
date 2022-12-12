import { render, useState} from "../node_modules/fre/dist/fre.esm.js"

function App() {
    const [count, setCount] = useState(0)
    console.log(count)
    const add = () =>{
        console.log('u clicked a button')
        setCount(count+1)
    }
    return (
        <view style={{ height: 100, width: 100 }} onClick={add}>
            {count}
        </view>
    )
}
render(<App />, document.body)
