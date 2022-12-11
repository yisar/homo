

export function flexLayout(node,x=0,y=0){
    node.style = node.style || {}
    node.style.x = x;
    node.style.y=y;
    x += (node.width || 0)
    y += (node.height || 0)
    node.childNodes.forEach(item => {
        flexLayout(item, x, y)
    });
}
