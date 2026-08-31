const colorListInput = document.getElementById('colorList');
const columnsInput = document.getElementById('columnsInput');
const tileSizeInput = document.getElementById('tileSizeInput');
const borderWidthInput = document.getElementById('borderWidth');
const borderColorInput = document.getElementById('borderColor');
const aspectMode = document.getElementById('aspectMode');
const autoColsCheckbox = document.getElementById('autoColsCheckbox');
const canvas = document.getElementById('textureCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const infoBar = document.getElementById('infoBar');
const detectedCount = document.getElementById('detectedCount');
const pixelInspector = document.getElementById('pixelInspector');
const downloadBtn = document.getElementById('downloadBtn');

let currentZoom = 1;

function updateUIState() {
  if (autoColsCheckbox.checked) {
    columnsInput.disabled = true;
    columnsInput.style.opacity = '0.45';
  } else {
    columnsInput.disabled = false;
    columnsInput.style.opacity = '1';
  }
}

function parseColors(text) {
  if (!text) return [];
  const tokens = text.split(/[\n,;\t]+/);
  const result = [];

  for (let raw of tokens) {
    let str = raw.trim().replace(/['"`;\[\]]/g, '');
    if (!str) continue;

    if (str.includes(':')) str = str.split(':').pop().trim();
    if (str.includes('=')) str = str.split('=').pop().trim();

    if (/^0x[0-9a-fA-F]{6}$/i.test(str)) {
      str = '#' + str.slice(2);
    }

    if (/^[0-9a-fA-F]{6}$/i.test(str) || /^[0-9a-fA-F]{3}$/i.test(str)) {
      str = '#' + str;
    }

    if (str.length > 0) {
      result.push(str);
    }
  }
  return result;
}

function colorToRGBA(str) {
  str = str.trim().replace(/['"]/g, '');
  if (str.startsWith('0x')) str = '#' + str.slice(2);
  if (/^[0-9a-fA-F]{6}$/i.test(str) || /^[0-9a-fA-F]{3}$/i.test(str)) str = '#' + str;

  if (str.startsWith('#')) {
    let hex = str.slice(1);
    if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
    if (hex.length >= 6) {
      const r = parseInt(hex.slice(0, 2), 16) || 0;
      const g = parseInt(hex.slice(2, 4), 16) || 0;
      const b = parseInt(hex.slice(4, 6), 16) || 0;
      return [r, g, b, 255];
    }
  }

  const rgbMatch = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbMatch) {
    return [
      Math.min(255, parseInt(rgbMatch[1], 10) || 0),
      Math.min(255, parseInt(rgbMatch[2], 10) || 0),
      Math.min(255, parseInt(rgbMatch[3], 10) || 0),
      255
    ];
  }

  const dummy = document.createElement('canvas');
  dummy.width = 1;
  dummy.height = 1;
  const dCtx = dummy.getContext('2d');
  dCtx.fillStyle = str;
  dCtx.fillRect(0, 0, 1, 1);
  const pixel = dCtx.getImageData(0, 0, 1, 1).data;
  return [pixel[0], pixel[1], pixel[2], 255];
}

function setZoom(zoom) {
  currentZoom = zoom;
  document.querySelectorAll('.zoom-btn').forEach(btn => {
    const text = btn.innerText.toLowerCase();
    btn.classList.toggle('active', 
      (zoom === 'fit' && text.includes('ajustar')) ||
      (zoom === 1 && text.includes('1x')) ||
      (zoom === 2 && text.includes('2x')) ||
      (zoom === 4 && text.includes('4x')) ||
      (zoom === 8 && text.includes('8x'))
    );
  });
  applyZoom();
}

function applyZoom() {
  if (currentZoom === 'fit') {
    canvas.style.width = 'auto';
    canvas.style.height = 'auto';
    canvas.style.maxWidth = '100%';
    canvas.style.maxHeight = '100%';
  } else {
    const z = parseInt(currentZoom, 10) || 1;
    canvas.style.maxWidth = 'none';
    canvas.style.maxHeight = 'none';
    canvas.style.width = (canvas.width * z) + 'px';
    canvas.style.height = (canvas.height * z) + 'px';
  }
}

function renderGrid() {
  const colors = parseColors(colorListInput.value);
  detectedCount.innerText = `${colors.length} colores detectados`;

  const tileSize = parseInt(tileSizeInput.value, 10) || 64;
  const borderW = parseInt(borderWidthInput.value, 10) || 0;
  const format = aspectMode.value;

  if (colors.length === 0) {
    canvas.width = 1;
    canvas.height = 1;
    ctx.clearRect(0, 0, 1, 1);
    infoBar.textContent = 'Sin colores para mostrar';
    return;
  }

  let cols;
  if (autoColsCheckbox.checked) {
    cols = Math.ceil(Math.sqrt(colors.length)) || 1;
    columnsInput.value = cols;
  } else {
    cols = Math.max(1, parseInt(columnsInput.value, 10) || 1);
  }

  const rows = Math.ceil(colors.length / cols) || 1;
  let gridW = cols * tileSize;
  let gridH = rows * tileSize;

  let canvasW = gridW;
  let canvasH = gridH;

  if (format === 'square_exact') {
    const maxSide = Math.max(gridW, gridH);
    canvasW = maxSide;
    canvasH = maxSide;
  }

  canvas.width = canvasW;
  canvas.height = canvasH;

  ctx.imageSmoothingEnabled = false;
  if ('webkitImageSmoothingEnabled' in ctx) ctx.webkitImageSmoothingEnabled = false;
  if ('mozImageSmoothingEnabled' in ctx) ctx.mozImageSmoothingEnabled = false;

  const imgData = ctx.createImageData(canvasW, canvasH);
  const data = imgData.data;

  const parsedColorsRGBA = colors.map(c => colorToRGBA(c));
  const borderRGBA = colorToRGBA(borderColorInput.value);
  const bgRGBA = colorToRGBA(borderColorInput.value);

  for (let y = 0; y < canvasH; y++) {
    const cellY = Math.floor(y / tileSize);
    const localY = y % tileSize;

    for (let x = 0; x < canvasW; x++) {
      const cellX = Math.floor(x / tileSize);
      const localX = x % tileSize;
      const pixelIndex = (y * canvasW + x) * 4;

      const colorIndex = cellY * cols + cellX;

      if (cellX >= cols || cellY >= rows || colorIndex >= colors.length) {
        data[pixelIndex]     = bgRGBA[0];
        data[pixelIndex + 1] = bgRGBA[1];
        data[pixelIndex + 2] = bgRGBA[2];
        data[pixelIndex + 3] = 255;
        continue;
      }

      const isBorder = borderW > 0 && (
        localX < borderW || localX >= (tileSize - borderW) ||
        localY < borderW || localY >= (tileSize - borderW)
      );

      if (isBorder) {
        data[pixelIndex]     = borderRGBA[0];
        data[pixelIndex + 1] = borderRGBA[1];
        data[pixelIndex + 2] = borderRGBA[2];
        data[pixelIndex + 3] = 255;
      } else {
        const col = parsedColorsRGBA[colorIndex];
        data[pixelIndex]     = col[0];
        data[pixelIndex + 1] = col[1];
        data[pixelIndex + 2] = col[2];
        data[pixelIndex + 3] = 255;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const isSquare = canvasW === canvasH;
  const squareLabel = isSquare ? 'Cuadrada 1:1' : 'Rectangular';
  infoBar.innerHTML = `Resolución: <span>${canvasW} x ${canvasH} px (${squareLabel})</span> | Colores: <span>${colors.length}</span> | Cuadrícula: <span>${cols}x${rows}</span> | Celda: <span>${tileSize}x${tileSize}px</span>`;
  applyZoom();
}

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const px = Math.floor((e.clientX - rect.left) * scaleX);
  const py = Math.floor((e.clientY - rect.top) * scaleY);

  if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
    const p = ctx.getImageData(px, py, 1, 1).data;
    const hex = '#' + [p[0], p[1], p[2]].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
    pixelInspector.innerHTML = `
      <span class="pixel-swatch" style="background-color: ${hex};"></span>
      <span>Píxel [${px}, ${py}]: <strong>${hex}</strong> (R:${p[0]} G:${p[1]} B:${p[2]})</span>
    `;
  }
});

function downloadPNG() {
  const link = document.createElement('a');
  link.download = `palette_${canvas.width}x${canvas.height}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

colorListInput.addEventListener('input', renderGrid);
columnsInput.addEventListener('input', renderGrid);
tileSizeInput.addEventListener('change', renderGrid);
borderWidthInput.addEventListener('change', renderGrid);
borderColorInput.addEventListener('input', renderGrid);
downloadBtn.addEventListener('click', downloadPNG);

updateUIState();
renderGrid();
