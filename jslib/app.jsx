import { render, h } from "fre";
import { polyfill } from "./polyfill.mjs";
polyfill();
render(<div style={{height:10}}>hello world!</div>, document.body);
