const empty = [0, 0, 0, 0]
const { is } = Object
const { max } = Math

export function measure(obj, ddd, vxy, vwh) {
  const { props: { style }, children } = obj
  const direction = +(!(style.direction === 'row'))
  const xxx = ddd
  const yyy = +(!xxx)

  const cxy = [0, 0, 0, 0, 0] // x/y/length/space/offset
  const cwh = [style.width ?? -0, style.height ?? -0, 0, 0, 0] // w/h/flex/used/implict
  const mmm = style.margin ?? empty
  obj.returns = { xxx, cxy, cwh }

  if (style.display === 'none') {
    return void (cwh[0] = cwh[1] = 0)
  }
  if ((style.position ?? 'r')[0] === 'r') {
    vxy[2] += 1
    vwh[2] += max(0, style.flex | 0)
  }
  for (let i = 0; i < children.length; ++i) {
    measure(children[i], direction, cxy, cwh)
  } 
  vwh[3] += (is(cwh[xxx], -0) ? cwh[3] : cwh[xxx]) + (mmm[xxx + 0] + mmm[xxx + 2]) // implicit inline size
  vwh[4] = max(vwh[4], (is(cwh[yyy], -0) ? cwh[4] : cwh[yyy]) + (mmm[yyy + 0] + mmm[yyy + 2])) // implicit block size
}

export function layout(obj, aaa, jjj, vxy, vwh, gpu) {
  const { props: { style }, children, returns: { xxx, cxy, cwh } } = obj
  const yyy = +(!xxx) // opposite of is row/column
  const ppp = style.padding ?? empty
  const mmm = style.margin ?? empty
  const position = +((style.position ?? 'r')[0]==='r') // position: (r)elative*, absolute, fixed
  const self = style.alignSelf
  const align = style.alignItems

  const justify = style.justifyContent

  if (self) aaa = self
    
  if (justify === 'reverse') {
    children = children.reverse() // todo
  }
  init: {
    cxy[xxx] += mmm[xxx + 0] + ppp[xxx + 0] + vxy[4]
    cxy[yyy] += mmm[yyy + 0] + ppp[yyy + 0]
  }
  size: {
    cwh[3] = cwh[3] + (ppp[xxx + 0] + ppp[xxx + 2] + ((cxy[2] - 1) * max(0, style.gap ?? 0))) // used space += padding + (n * gap)
    cwh[xxx] = is(cwh[xxx], -0) ? (!position ? cwh[3] : (vwh[xxx] - vwh[3]) * ((max(0, style.flex | 0) || 1) / vwh[2])) : cwh[xxx] // if implicit sized then size = (total space - used space) * (flex or 1)/(total flex)
    cwh[yyy] = is(cwh[yyy], -0) ? (!position ? cwh[4] : (vwh[4] || vwh[yyy])) : cwh[yyy]
  }
  position: {
    for (let [lt, rb, ww, xy, wh] of [[style.left ?? -0, style.right ?? -0, cwh[0], 0, 1], [style.top ?? -0, style.bottom ?? -0, cwh[1], 0, 1]])
      if (!is(lt, -0) && !is(rb, -0) && is(ww, -0)) { // left, right set while width is undefined
        cxy[xy] = (position ? cxy : vxy)[xy] + lt // node[x/y] = root[x/y] + l/t
        cwh[wh] = vwh[wh] - lt - rb // node[w/h] = root[w/h] - l/t - r/b
      } else if (lt != null) cxy[xy] = (position ? cxy : vxy)[xy] + lt // when only l/t, node[x/y] = root/node[x/y] + l/t dependant on absolute position
      else if (rb != null) cxy[xy] = vxy[xy] - rb + (rel ? 0 : vwh[wh] - cwh[wh]) // when only right/bottom node[x/y] = root[x/y] - r/b + (root[w\h] - node[w\h]) ...
      else if (!position) cxy[xy] = vxy[xy] // node[x/y] = root[x/y]
  }
  align: {
    let [yx, hw] = [[1, 1], [0, 0]][xxx] 
    if (position) switch (aaa) { 
      case 'end':
        cxy[yx] = vwh[hw] - cwh[hw]
        break
      case 'center':
        cxy[yx] = vwh[hw] / 2 - cwh[hw] / 2
        break // ce(n)ter
      case 'stretch':
        cxy[yx] = vwh[hw]
        break
    }
  }
  justify: {
    let [xy, wh] = [[0, 0], [1, 1]][xxx]
    if (position) switch (jjj) {
      case 'end':
        cxy[xy] = vwh[wh] - cwh[wh]
        break
      case 'center':
        cxy[xy] = vwh[wh] / 2 - cwh[wh] / 2
        break // ce(n)ter given that mathematically (1 + 1 + 1)/2 is equivalent to (1/2) + (1/2) + (1/2)
      case 'stretch':
        cxy[xy] = vwh[wh]
        break
    }
  }
  draw: {
    gpu(obj, [vxy[0] + cxy[0], vxy[1] + cxy[1]], [cwh[0], cwh[1]])
  }
  each: {
    for (var i = 0; i < children.length; i++) {
      layout(children[i], align, justify, cxy, cwh, gpu)
    }
  }
  move: { // margin padding cursor
    cxy[xxx] += mmm[yyy + 2] + ppp[yyy + 2] + cwh[xxx]
    vxy[4] += cxy[xxx]
  }
}