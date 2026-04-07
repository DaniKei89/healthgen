import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp", "image/tiff",
  "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/dicom", "application/octet-stream",
  "text/plain",
];

export function validateFile(file) {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File exceeds the ${MAX_FILE_SIZE / (1024*1024)}MB limit` };
  }
  // Allow any accepted type, or common medical file extensions
  const ext = file.name?.split('.').pop()?.toLowerCase();
  const medicalExts = ['dcm', 'dicom', 'nii', 'nii.gz'];
  if (!ACCEPTED_TYPES.includes(file.type) && !medicalExts.includes(ext)) {
    return { valid: false, error: "Unsupported file type. Accepted: PDF, images, Word docs, DICOM" };
  }
  return { valid: true };
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function uploadDocument(uid, file, onProgress) {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `users/${uid}/documents/${timestamp}_${safeName}`;
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(Math.round(progress));
      },
      (error) => reject(error),
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({ path, downloadUrl });
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

export async function getDocUrl(path) {
  return getDownloadURL(ref(storage, path));
}

export async function removeFile(path) {
  return deleteObject(ref(storage, path));
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1]; // Remove data:mime;base64, prefix
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function getEmojiForType(type) {
  const map = {
    "Analítica": "🩸",
    "Radiografía": "🦴",
    "MRI/TAC": "🧠",
    "Informe": "📋",
    "Receta": "💊",
    "Oftalm.": "👁️",
    "Dermat.": "🧴",
    "Otro": "📄",
  };
  return map[type] || "📄";
}
