import { render, h } from "fre";
import { polyfill } from "./polyfill.mjs";
polyfill();
render(<view style={{height:100, width:100}}>hello world!</view>, document.body);
