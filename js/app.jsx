import { render, h } from "fre";
import { polyfill } from "./polyfill.mjs";
polyfill();
render(<div>hello world</div>, document.body);
