/* =========================
   PHOTO TOOL JS START
   ========================= */

const photoInput = document.getElementById("photoInput");
const photoCanvas = document.getElementById("photoCanvas");
const downloadPhotoBtn = document.getElementById("downloadPhotoBtn");
const photoStatus = document.getElementById("photoStatus");

const photoCtx = photoCanvas.getContext("2d");

const PHOTO_TARGET_WIDTH = 213;
const PHOTO_TARGET_HEIGHT = 213;
const PHOTO_MIN_KB = 10;
const PHOTO_MAX_KB = 15;

let finalPhotoBlob = null;

drawPhotoPlaceholder();

photoInput.addEventListener("change", handlePhotoSelect);
downloadPhotoBtn.addEventListener("click", downloadFinalPhoto);

function drawPhotoPlaceholder() {
  photoCtx.clearRect(0, 0, photoCanvas.width, photoCanvas.height);
  photoCtx.fillStyle = "#ffffff";
  photoCtx.fillRect(0, 0, photoCanvas.width, photoCanvas.height);

  photoCtx.strokeStyle = "#cbd5e1";
  photoCtx.lineWidth = 2;
  photoCtx.setLineDash([6, 6]);
  photoCtx.strokeRect(10, 10, photoCanvas.width - 20, photoCanvas.height - 20);
  photoCtx.setLineDash([]);

  photoCtx.fillStyle = "#64748b";
  photoCtx.textAlign = "center";
  photoCtx.font = "bold 16px Arial";
  photoCtx.fillText("Photo Preview", photoCanvas.width / 2, photoCanvas.height / 2 - 8);

  photoCtx.font = "12px Arial";
  photoCtx.fillText("Choose File karke image upload karein", photoCanvas.width / 2, photoCanvas.height / 2 + 16);
}

async function handlePhotoSelect(event) {
  const file = event.target.files[0];

  if (!file) {
    finalPhotoBlob = null;
    drawPhotoPlaceholder();
    photoStatus.textContent = "Preview yahan dikhega.";
    return;
  }

  photoStatus.textContent = "Photo process ho rahi hai...";

  try {
    const image = await loadImageFromFile(file);

    // 213x213 preview canvas par image draw karo
    drawImageCoverOnCanvas(image, photoCtx, PHOTO_TARGET_WIDTH, PHOTO_TARGET_HEIGHT);

    // Final JPG blob banao 10-15 KB ke aas paas
    finalPhotoBlob = await generatePhotoBlobInSizeRange(
      photoCanvas,
      PHOTO_MIN_KB,
      PHOTO_MAX_KB
    );

    const finalKB = (finalPhotoBlob.size / 1024).toFixed(2);

    photoStatus.textContent =
      `Photo ready hai. JPG | 213×213 px | ${finalKB} KB`;
  } catch (error) {
    console.error(error);
    finalPhotoBlob = null;
    drawPhotoPlaceholder();
    photoStatus.textContent = "Photo process nahi ho payi. Dusri image try kijiye.";
  }
}

function downloadFinalPhoto() {
  if (!finalPhotoBlob) {
    alert("Pehle photo select kijiye.");
    return;
  }

  const url = URL.createObjectURL(finalPhotoBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "pan-photo.jpg";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      const img = new Image();

      img.onload = function () {
        resolve(img);
      };

      img.onerror = function () {
        reject(new Error("Image load failed"));
      };

      img.src = e.target.result;
    };

    reader.onerror = function () {
      reject(new Error("File read failed"));
    };

    reader.readAsDataURL(file);
  });
}

function drawImageCoverOnCanvas(image, context, targetWidth, targetHeight) {
  context.clearRect(0, 0, targetWidth, targetHeight);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, targetWidth, targetHeight);

  const imageRatio = image.width / image.height;
  const targetRatio = targetWidth / targetHeight;

  let drawWidth = 0;
  let drawHeight = 0;
  let offsetX = 0;
  let offsetY = 0;

  if (imageRatio > targetRatio) {
    drawHeight = targetHeight;
    drawWidth = image.width * (targetHeight / image.height);
    offsetX = (targetWidth - drawWidth) / 2;
    offsetY = 0;
  } else {
    drawWidth = targetWidth;
    drawHeight = image.height * (targetWidth / image.width);
    offsetX = 0;
    offsetY = (targetHeight - drawHeight) / 2;
  }

  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

async function generatePhotoBlobInSizeRange(canvas, minKB, maxKB) {
  let bestBlob = null;
  let bestDistance = Infinity;

  // High to low quality check
  for (let quality = 0.95; quality >= 0.05; quality -= 0.02) {
    const blob = await canvasToBlob(canvas, "image/jpeg", quality);
    const sizeKB = blob.size / 1024;

    if (sizeKB >= minKB && sizeKB <= maxKB) {
      return blob;
    }

    const distance = getDistanceFromRange(sizeKB, minKB, maxKB);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestBlob = blob;
    }
  }

  return bestBlob;
}

function getDistanceFromRange(value, min, max) {
  if (value < min) return min - value;
  if (value > max) return value - max;
  return 0;
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      function (blob) {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Blob create nahi hua"));
        }
      },
      type,
      quality
    );
  });
}

/* =========================
   PHOTO TOOL JS END
   ========================= */
 /* =========================
   SIGNATURE TOOL JS START
   ========================= */

const signInput = document.getElementById("signInput");
const signCanvas = document.getElementById("signCanvas");
const downloadSignBtn = document.getElementById("downloadSignBtn");
const signStatus = document.getElementById("signStatus");

const signCtx = signCanvas.getContext("2d");

const SIGN_TARGET_WIDTH = 400;
const SIGN_TARGET_HEIGHT = 200;
const SIGN_MIN_KB = 20;
const SIGN_MAX_KB = 30;

let finalSignBlob = null;

drawSignaturePlaceholder();

signInput.addEventListener("change", handleSignatureSelect);
downloadSignBtn.addEventListener("click", downloadFinalSignature);

function drawSignaturePlaceholder() {
  signCtx.clearRect(0, 0, signCanvas.width, signCanvas.height);
  signCtx.fillStyle = "#ffffff";
  signCtx.fillRect(0, 0, signCanvas.width, signCanvas.height);

  signCtx.strokeStyle = "#cbd5e1";
  signCtx.lineWidth = 2;
  signCtx.setLineDash([8, 8]);
  signCtx.strokeRect(12, 12, signCanvas.width - 24, signCanvas.height - 24);
  signCtx.setLineDash([]);

  signCtx.fillStyle = "#64748b";
  signCtx.textAlign = "center";
  signCtx.font = "bold 24px Arial";
  signCtx.fillText("Signature Preview", signCanvas.width / 2, signCanvas.height / 2 - 10);

  signCtx.font = "16px Arial";
  signCtx.fillText(
    "Choose File karke signature upload karein",
    signCanvas.width / 2,
    signCanvas.height / 2 + 24
  );
}

async function handleSignatureSelect(event) {
  const file = event.target.files[0];

  if (!file) {
    finalSignBlob = null;
    drawSignaturePlaceholder();
    signStatus.textContent = "Signature preview yahan dikhega.";
    return;
  }

  signStatus.textContent = "Signature process ho rahi hai...";

  try {
    const image = await loadImageFromFile(file);

    drawSignatureFullFit(image, signCtx, SIGN_TARGET_WIDTH, SIGN_TARGET_HEIGHT);

    finalSignBlob = await generateSignatureBlobInSizeRange(
      signCanvas,
      SIGN_MIN_KB,
      SIGN_MAX_KB
    );

    const finalKB = (finalSignBlob.size / 1024).toFixed(2);

    signStatus.textContent =
      `Signature ready hai. JPG | 400×200 px | ${finalKB} KB`;
  } catch (error) {
    console.error(error);
    finalSignBlob = null;
    drawSignaturePlaceholder();
    signStatus.textContent = "Signature process nahi ho payi. Dusri image try kijiye.";
  }
}

function downloadFinalSignature() {
  if (!finalSignBlob) {
    alert("Pehle signature select kijiye.");
    return;
  }

  const url = URL.createObjectURL(finalSignBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "pan-signature.jpg";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function drawSignatureFullFit(image, context, targetWidth, targetHeight) {
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  tempCanvas.width = image.width;
  tempCanvas.height = image.height;

  tempCtx.fillStyle = "#ffffff";
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  tempCtx.drawImage(image, 0, 0);

  const trimBox = getSignatureTrimBounds(tempCanvas, tempCtx);

  context.clearRect(0, 0, targetWidth, targetHeight);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, targetWidth, targetHeight);

  context.drawImage(
    tempCanvas,
    trimBox.x,
    trimBox.y,
    trimBox.width,
    trimBox.height,
    0,
    0,
    targetWidth,
    targetHeight
  );
}

function getSignatureTrimBounds(canvas, context) {
  const { width, height } = canvas;
  const imageData = context.getImageData(0, 0, width, height).data;

  let top = height;
  let left = width;
  let right = -1;
  let bottom = -1;

  const whiteThreshold = 245;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const r = imageData[index];
      const g = imageData[index + 1];
      const b = imageData[index + 2];
      const a = imageData[index + 3];

      const isInk =
        a > 10 &&
        !(r >= whiteThreshold && g >= whiteThreshold && b >= whiteThreshold);

      if (isInk) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }

  if (right === -1 || bottom === -1) {
    return {
      x: 0,
      y: 0,
      width: width,
      height: height
    };
  }

  const contentWidth = right - left + 1;
  const contentHeight = bottom - top + 1;

  const extraPadX = Math.max(2, Math.round(contentWidth * 0.01));
  const extraPadY = Math.max(2, Math.round(contentHeight * 0.02));

  left = Math.max(0, left - extraPadX);
  top = Math.max(0, top - extraPadY);
  right = Math.min(width - 1, right + extraPadX);
  bottom = Math.min(height - 1, bottom + extraPadY);

  return {
    x: left,
    y: top,
    width: right - left + 1,
    height: bottom - top + 1
  };
}

async function generateSignatureBlobInSizeRange(canvas, minKB, maxKB) {
  let bestBlob = null;
  let bestDistance = Infinity;

  for (let quality = 0.95; quality >= 0.05; quality -= 0.02) {
    const blob = await canvasToBlob(canvas, "image/jpeg", quality);
    const sizeKB = blob.size / 1024;

    if (sizeKB >= minKB && sizeKB <= maxKB) {
      return blob;
    }

    const distance = getDistanceFromRange(sizeKB, minKB, maxKB);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestBlob = blob;
    }
  }

  return bestBlob;
}

/* =========================
   SIGNATURE TOOL JS END
   ========================= */