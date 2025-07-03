// Script para generar íconos PNG para SoftZen
// Este script crea íconos base64 que pueden ser convertidos a PNG

const iconData192 = `
<svg width="192" height="192" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8B7CF6"/>
      <stop offset="100%" style="stop-color:#6366F1"/>
    </linearGradient>
  </defs>
  <rect width="192" height="192" rx="24" fill="url(#bg)"/>
  <text x="96" y="110" font-family="Arial" font-size="80" text-anchor="middle" fill="white">🧘‍♀️</text>
  <text x="96" y="170" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="white">SoftZen</text>
</svg>
`;

const iconData512 = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8B7CF6"/>
      <stop offset="100%" style="stop-color:#6366F1"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="64" fill="url(#bg)"/>
  <text x="256" y="290" font-family="Arial" font-size="200" text-anchor="middle" fill="white">🧘‍♀️</text>
  <text x="256" y="450" font-family="Arial" font-size="42" font-weight="bold" text-anchor="middle" fill="white">SoftZen</text>
</svg>
`;

// Función para convertir SVG a PNG usando Canvas
function svgToPng(svgString, width, height, callback) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = width;
    canvas.height = height;
    
    const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = function() {
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        
        canvas.toBlob(callback, 'image/png');
    };
    
    img.src = url;
}

// Función para descargar blob como archivo
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Generar y descargar íconos
console.log('Generando íconos...');

svgToPng(iconData192, 192, 192, (blob) => {
    downloadBlob(blob, 'icon-192.png');
    console.log('icon-192.png generado');
});

svgToPng(iconData512, 512, 512, (blob) => {
    downloadBlob(blob, 'icon-512.png');
    console.log('icon-512.png generado');
});
