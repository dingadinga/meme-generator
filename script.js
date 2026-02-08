// Get DOM elements
const canvas = document.getElementById('memeCanvas');
const ctx = canvas.getContext('2d');
const imageUpload = document.getElementById('imageUpload');
const topTextInput = document.getElementById('topText');
const bottomTextInput = document.getElementById('bottomText');
const fontSizeSlider = document.getElementById('fontSize');
const fontSizeValue = document.getElementById('fontSizeValue');
const downloadBtn = document.getElementById('downloadBtn');
const canvasPlaceholder = document.getElementById('canvasPlaceholder');

// State
let image = null;
let fontSize = 40;

// Initialize
fontSizeValue.textContent = fontSize;

// Image upload handler
imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            image = img;
            setupCanvas();
            drawMeme();
            canvasPlaceholder.classList.add('hidden');
            downloadBtn.disabled = false;
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

// Setup canvas dimensions based on image
function setupCanvas() {
    if (!image) return;

    // Calculate dimensions to fit within max width while maintaining aspect ratio
    const maxWidth = 800;
    const maxHeight = 600;
    
    let width = image.width;
    let height = image.height;

    // Scale down if too large
    if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
    }
    if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
    }

    canvas.width = width;
    canvas.height = height;
}

// Draw meme on canvas
function drawMeme() {
    if (!image) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Set text properties
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = `bold ${fontSize}px Impact, Arial Black, sans-serif`;
    
    // Text styling - white fill with black stroke
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = Math.max(2, fontSize / 20); // Scale stroke width with font size
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;

    // Draw top text
    const topText = topTextInput.value.trim();
    if (topText) {
        drawTextWithOutline(topText, canvas.width / 2, fontSize * 0.3);
    }

    // Draw bottom text
    const bottomText = bottomTextInput.value.trim();
    if (bottomText) {
        drawTextWithOutline(bottomText, canvas.width / 2, canvas.height - fontSize * 1.5);
    }
}

// Draw text with white fill and black stroke (outline)
function drawTextWithOutline(text, x, y) {
    // Calculate text width for wrapping
    const maxWidth = canvas.width * 0.9;
    const words = text.split(' ');
    let line = '';
    let lineY = y;

    // Simple text wrapping
    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth && i > 0) {
            // Draw the current line
            ctx.strokeText(line, x, lineY);
            ctx.fillText(line, x, lineY);
            line = words[i] + ' ';
            lineY += fontSize * 1.2; // Line height
        } else {
            line = testLine;
        }
    }

    // Draw the last line
    ctx.strokeText(line, x, lineY);
    ctx.fillText(line, x, lineY);
}

// Text input handlers
topTextInput.addEventListener('input', drawMeme);
bottomTextInput.addEventListener('input', drawMeme);

// Font size slider handler
fontSizeSlider.addEventListener('input', (e) => {
    fontSize = parseInt(e.target.value);
    fontSizeValue.textContent = fontSize;
    drawMeme();
});

// Download button handler
downloadBtn.addEventListener('click', () => {
    if (!image) {
        alert('Please upload an image first.');
        return;
    }

    // Create a temporary canvas with full resolution
    const downloadCanvas = document.createElement('canvas');
    const downloadCtx = downloadCanvas.getContext('2d');
    
    // Use original image dimensions for download
    downloadCanvas.width = image.width;
    downloadCanvas.height = image.height;

    // Draw image at full resolution
    downloadCtx.drawImage(image, 0, 0, downloadCanvas.width, downloadCanvas.height);

    // Set text properties for full resolution
    downloadCtx.textAlign = 'center';
    downloadCtx.textBaseline = 'top';
    
    // Scale font size proportionally
    const scaleFactor = image.width / canvas.width;
    const scaledFontSize = fontSize * scaleFactor;
    downloadCtx.font = `bold ${scaledFontSize}px Impact, Arial Black, sans-serif`;
    
    // Text styling
    downloadCtx.fillStyle = 'white';
    downloadCtx.strokeStyle = 'black';
    downloadCtx.lineWidth = Math.max(2, scaledFontSize / 20);
    downloadCtx.lineJoin = 'round';
    downloadCtx.miterLimit = 2;

    // Draw top text
    const topText = topTextInput.value.trim();
    if (topText) {
        drawTextOnDownloadCanvas(downloadCtx, topText, downloadCanvas.width / 2, scaledFontSize * 0.3, downloadCanvas.width, scaledFontSize);
    }

    // Draw bottom text
    const bottomText = bottomTextInput.value.trim();
    if (bottomText) {
        drawTextOnDownloadCanvas(downloadCtx, bottomText, downloadCanvas.width / 2, downloadCanvas.height - scaledFontSize * 1.5, downloadCanvas.width, scaledFontSize);
    }

    // Convert to data URL and download
    const dataURL = downloadCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = dataURL;
    link.click();
});

// Helper function to draw text on download canvas with wrapping
function drawTextOnDownloadCanvas(ctx, text, x, y, maxWidth, fontSize) {
    const words = text.split(' ');
    let line = '';
    let lineY = y;
    const textMaxWidth = maxWidth * 0.9;

    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > textMaxWidth && i > 0) {
            ctx.strokeText(line, x, lineY);
            ctx.fillText(line, x, lineY);
            line = words[i] + ' ';
            lineY += fontSize * 1.2;
        } else {
            line = testLine;
        }
    }

    ctx.strokeText(line, x, lineY);
    ctx.fillText(line, x, lineY);
}

// Prevent drag and drop default behavior
document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        imageUpload.files = files;
        imageUpload.dispatchEvent(new Event('change'));
    }
});

// Allow clicking on upload label to trigger file input
document.querySelector('.upload-label').addEventListener('click', () => {
    imageUpload.click();
});

console.log('Meme Generator loaded successfully!');
