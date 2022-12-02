const { h, render } = this.fre;

function App() {
  return h("div", {}, "hello world");
}

render(h(App, {}));
