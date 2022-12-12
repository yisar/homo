// soga 算法简单实现

let pos1 = 0
let pos2 = 0
let size1 = 0
let size2 = 0

export function flexLayout(node) {
    node.style = node.style || {}

    node.style = {
        height: node.style.height || 0,
        width: node.style.width || 0,
        grow: node.style.grow || 0,
        shrink: node.style.shrink || 1,
        direction: node.style.direction || 'row',
        wrap: node.style.wrap || 'nowrap'
    }

    let x = 0
    let y = 0
    let direction = node.style.direction
    let wrap = node.style.wrap

    let flex_dim = 0
    let align_dim = 0
    let size_dim = 0

    let grows = 0
    let shrinks = 1

    switch (direction) {
        case 'row':
            flex_dim = node.style.width
            size_dim = node.style.width
            align_dim = node.style.height
            pos1 = 0
            pos2 = 1
            size1 = 2
            size2 = 3
            break
        case 'column':
            flex_dim = node.style.height
            size_dim = node.style.height
            align_dim = node.style.width
            pos1 = 1
            pos2 = 0
            size1 = 3
            size2 = 2
            break

    }
    for (let i = 0; i < node.childNodes.length; i++) {
        let child = node.childNodes[i]
        let temp_rect = [0, 0, 0, 0]
        let style = child.style || {
            height: 0,
            width: 0,
            grow: 0,
            shrink: 1
        }
        temp_rect[size1] = style.width
        temp_rect[size2] = style.height

        flex_dim -= temp_rect[size1]

        grows += style.grow
        shrinks += style.shrinks
    }

    for (let i = 0; i < node.childNodes.length; i++) {
        let child = node.childNodes[i]
        let style = child.style || {
            height: 0,
            width: 0,
            grow: 0,
            shrink: 1
        }
        let child_w = style.width
        let child_h = style.height

        let res_rect = [0, 0, 0, 0]

        res_rect[size1] = child_w
        res_rect[size2] = child_h

        let size = 0

        switch (wrap) {
            case 'wrap':
                let child_size = res_rect[size1]
                if (child_size > size_dim) {
                    x = 0
                    y += res_rect[size2]
                } else {
                    size_dim -= child_size
                }
                break
            case 'nowrap':
                if (flex_dim > 0) {
                    if (child.style.grow) {
                        size += (flex_dim / grows) * style.grow;
                    }
                } else if (flex_dim < 0) {
                    if (child.style.shrink) {
                        size += (flex_dim / shrinks) * style.shrink
                    }
                }
                break
        }

        if (x == 0) {
            switch (node.style.justifyContent) {
                case 'center':
                    x = flex_dim / 2
                    break
            }
        }

        res_rect[pos1] += x

        let align = y

        switch (node.style.alignItems) {
            case 'center':
                align = (align_dim / 2) - (res_rect[size2] / 2);
                break
        }

        res_rect[size1] += size
        res_rect[pos2] = align


        x += res_rect[size1]
        y += res_rect[size2]

        child.rect = res_rect
        console.log(child.nodeName,JSON.stringify(res_rect))

        flexLayout(child)
    }
}
