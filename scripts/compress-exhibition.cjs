// 展览馆图片压缩脚本：把素材库原图压缩后输出到 src/assets/exhibition/ 供前端构建使用
//
// 用法：
//   npm run compress:exhibition               # 正常压缩（幂等：目标不旧于源则跳过）
//   npm run compress:exhibition -- --force    # 强制重压所有图片
//   npm run compress:exhibition -- --no-prune # 保留源目录中已不存在的旧输出
//   npm run compress:exhibition -- --no-palette # PNG 不用调色板量化（照片质感图防色带）
//
// 约定：
//   - 原图放素材库目录（如根目录「侨批展示库/」），压缩产物提交进仓库
//   - 输出统一最长边 1600（灯箱放大看细节与流量的平衡点），扩展名统一小写
//   - 图片永不直接放 public/（vercel.json 对 public 路径是 no-store，每次访问都会重新下载）
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 素材库 → 前端资产目录 映射（素材库不存在时跳过并提示，不报错）
const DIRS = [
  { src: '侨批展示库', out: 'src/assets/exhibition/qiaopi' },
  { src: 'IP素材库', out: 'src/assets/exhibition/ip' },
];

const MAX_EDGE = 1600; // resize 最长边上限
const JPG_EXT = ['.jpg', '.jpeg'];
const PNG_EXT = ['.png'];
const ALL_EXT = [...JPG_EXT, ...PNG_EXT, '.webp'];

const FORCE = process.argv.includes('--force');
const PRUNE = !process.argv.includes('--no-prune');
const USE_PALETTE = !process.argv.includes('--no-palette');

// 统计：用于结尾汇总
let compressed = 0;
let skipped = 0;
let pruned = 0;
let savedBytes = 0;

async function compressFile(srcFile, outFile) {
  const outDir = path.dirname(outFile);
  fs.mkdirSync(outDir, { recursive: true });

  const srcStat = fs.statSync(srcFile);
  if (!FORCE && fs.existsSync(outFile)) {
    const outStat = fs.statSync(outFile);
    if (outStat.mtimeMs >= srcStat.mtimeMs) {
      skipped++;
      console.log(`SKIP  ${path.basename(srcFile)}（目标已是最新，--force 可强制重压）`);
      return;
    }
  }

  const ext = path.extname(srcFile).toLowerCase();
  let pipeline = sharp(srcFile)
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true });

  if (JPG_EXT.includes(ext)) {
    // jpg 一律转 jpeg：mozjpeg 压缩率高，progressive 渐进式加载提升感知速度
    pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true, progressive: true });
  } else if (PNG_EXT.includes(ext)) {
    // png 保持透明通道；palette 量化对平涂色设计图（如 IP 形象）可显著压缩，
    // 照片质感图若出现色带，用 --no-palette 关闭
    pipeline = pipeline.png({
      compressionLevel: 9,
      ...(USE_PALETTE ? { palette: true, quality: 90 } : {}),
    });
  } else {
    // 未知格式（如 webp）原样拷贝，不重编码
    fs.copyFileSync(srcFile, outFile);
    compressed++;
    console.log(`COPY  ${path.basename(srcFile)}（格式不重编码）`);
    return;
  }

  // 输出扩展名统一小写（大写扩展名会逃过 import.meta.glob 的 *.jpg 匹配）
  const outPath = outFile.replace(/\.(jpe?g|png|webp)$/i, ext === '.jpeg' ? '.jpg' : ext);
  const before = srcStat.size;
  await pipeline.toFile(outPath);
  const after = fs.statSync(outPath).size;
  savedBytes += before - after;
  compressed++;
  console.log(
    `OK    ${path.basename(srcFile)}  ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB` +
    `（${path.relative(outDir, outPath)}）`
  );
}

async function processDir({ src, out }) {
  if (!fs.existsSync(src)) {
    console.log(`SKIP  「${src}/」不存在，跳过（素材就绪后放入原图即可）`);
    return;
  }
  const files = fs.readdirSync(src).filter((f) => ALL_EXT.includes(path.extname(f).toLowerCase()));
  if (files.length === 0) {
    console.log(`SKIP  「${src}/」无图片文件`);
    return;
  }
  console.log(`\n== 「${src}/」 -> 「${out}/」 ==`);
  for (const f of files) {
    await compressFile(path.join(src, f), path.join(out, f));
  }

  // 清理：源目录已不存在的 basename，删除对应输出（防止改文件名后留垃圾）
  if (PRUNE && fs.existsSync(out)) {
    const srcNames = new Set(files.map((f) => path.basename(f).toLowerCase()));
    for (const f of fs.readdirSync(out)) {
      if (f === '.gitkeep') continue;
      const norm = f.toLowerCase();
      // 压缩脚本输出扩展名统一小写，故只比对小写即可
      if (!srcNames.has(norm)) {
        fs.unlinkSync(path.join(out, f));
        pruned++;
        console.log(`PRUNE ${f}（源目录已不存在，删除旧输出）`);
      }
    }
  }
}

(async () => {
  for (const d of DIRS) await processDir(d);
  console.log(
    `\nDONE 压缩 ${compressed} 张，跳过 ${skipped} 张，清理 ${pruned} 张，` +
    `共节省 ${(savedBytes / 1024).toFixed(0)}KB`
  );
})().catch((err) => {
  console.error('压缩失败：', err.message);
  process.exit(1);
});
