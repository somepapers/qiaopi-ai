// 一次性图像处理脚本：把「侨批印章设计.png」抠图成透明背景印章
const fs = require('fs');
const { PNG } = require('pngjs');

const src = PNG.sync.read(fs.readFileSync('侨批印章设计.png'));
const { width: W, height: H, data } = src; // RGBA

// 1) 抠图：按「红色度」设 alpha。红章保留，米色纸底 / 浅灰水印透明。
const redness = (r, g, b) => r - (g + b) / 2;
const smooth = (e0, e1, x) => { x = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return x * x * (3 - 2 * x); };
for (let i = 0; i < W * H; i++) {
  const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
  let a = smooth(38, 78, redness(r, g, b)) * 255;
  if (a < 45) a = 0; // 清除淡残留
  data[i * 4 + 3] = a;
}

// 2) 找非透明区域 bounding box，裁掉四周留白
let minX = W, minY = H, maxX = 0, maxY = 0;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (data[(y * W + x) * 4 + 3] > 10) {
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
}
const pad = 10;
minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
maxX = Math.min(W - 1, maxX + pad); maxY = Math.min(H - 1, maxY + pad);
const cw = maxX - minX + 1, ch = maxY - minY + 1;

// 3) premultiplied box 降采样压缩
const targetMax = 900;
const factor = Math.max(1, Math.ceil(Math.max(cw, ch) / targetMax));
const ow = Math.ceil(cw / factor), oh = Math.ceil(ch / factor);
const out = new PNG({ width: ow, height: oh });
for (let oy = 0; oy < oh; oy++) for (let ox = 0; ox < ow; ox++) {
  let ar = 0, ag = 0, ab = 0, aa = 0, n = 0;
  for (let dy = 0; dy < factor; dy++) for (let dx = 0; dx < factor; dx++) {
    const sx = minX + ox * factor + dx, sy = minY + oy * factor + dy;
    if (sx > maxX || sy > maxY) continue;
    const idx = (sy * W + sx) * 4, a = data[idx + 3];
    ar += data[idx] * a; ag += data[idx + 1] * a; ab += data[idx + 2] * a; aa += a; n++;
  }
  const o = (oy * ow + ox) * 4;
  if (aa > 0) { out.data[o] = ar / aa; out.data[o + 1] = ag / aa; out.data[o + 2] = ab / aa; out.data[o + 3] = aa / n; }
  else { out.data[o] = out.data[o + 1] = out.data[o + 2] = out.data[o + 3] = 0; }
}
fs.writeFileSync('public/qiaopi-seal.png', PNG.sync.write(out, { colorType: 6 }));
console.log('DONE src=' + W + 'x' + H + ' crop=' + cw + 'x' + ch + ' out=' + ow + 'x' + oh + ' factor=' + factor);
console.log('bbox=' + minX + ',' + minY + ' -> ' + maxX + ',' + maxY);
