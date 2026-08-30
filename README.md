# 🎨 Palette Grid Texture Generator

Herramienta web autónoma y de alta precisión pixel-perfect para generar texturas de paletas de color y cuadrículas UV para motores de videojuegos (**Roblox**, **Blender**, **Unity**, **Unreal Engine**) y modelado 3D low-poly.

---

## ✨ Características Principales

* **Corte Seco Píxel por Píxel (0% Anti-Aliasing):** Renderizado directo en memoria de bytes (`ImageData` + `putImageData`), evitando cualquier suavizado, interpolación o difuminado en los bordes entre colores.
* **Formato Cuadrado 1:1 Forzado:** Opción para generar texturas perfectamente cuadradas ($1:1$) o en resoluciones **Potencia de 2 (PoT)** ($128\times128$, $256\times256$, $512\times512$, $1024\times1024$, etc.) requeridas por motores 3D.
* **Cálculo Automático de Columnas ($\sqrt{N}$):** Distribuye automáticamente los colores en una cuadrícula simétrica.
* **Inspector de Píxeles en Tiempo Real:** Visualiza las coordenadas exactas $[X, Y]$ y el código HEX/RGB bajo el cursor.
* **Controles de Zoom Nativo:** Previsualización en resoluciones enteras ($1\text{x}$, $2\text{x}$, $4\text{x}$, $8\text{x}$ y Ajustar) para verificar cada píxel sin distorsión óptica.
* **Diseño Minimalista Adobe Spectrum:** Interfaz profesional basada en la paleta monocromática de Adobe Illustrator (`#0D0D0D`, `#595959`, `#8C8C8C`, `#BFBFBF`, `#F2F2F2`).
* **100% Autónomo:** Funciona localmente en cualquier navegador web sin requerir dependencias externas ni conexión a internet.

---

## 🚀 Uso Rápido

1. Clona el repositorio o descarga el archivo `index.html`:
   ```bash
   git clone https://github.com/cuni10/palette-grid-texture-generator.git
   ```
2. Abre `index.html` en tu navegador favorito (Chrome, Firefox, Edge, Safari).
3. Pega tu lista de colores (soporta HEX, RGB, 0xHEX, o nombres).
4. Elige el tamaño de celda y formato de salida.
5. Haz clic en **Descargar Textura PNG**.

---

## 🛠️ Tecnologías

* HTML5 / CSS3 (CSS Custom Properties, Grid, Flexbox)
* Canvas 2D API (Direct Byte Buffer Rasterization)
* JavaScript Vanilla (ES6+)

---

## 📄 Licencia

Distribuido bajo la Licencia MIT. Consulta `LICENSE` para más detalles.
