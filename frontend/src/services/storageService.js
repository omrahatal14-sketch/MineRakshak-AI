import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firebaseStorage } from "../config/firebase.js";

/**
 * Uploads an evidence file to Firebase Storage under `evidence/<timestamp>_<filename>`
 * Returns an object with { name, url, path, size, type, uploadedAt }
 */
export async function uploadEvidenceFile(file, folder = "evidence") {
  if (!file) throw new Error("No file provided");

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const storagePath = `${folder}/${timestamp}_${safeName}`;

  if (firebaseStorage) {
    try {
      const storageRef = ref(firebaseStorage, storagePath);
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type || "application/octet-stream",
      });
      const downloadUrl = await getDownloadURL(snapshot.ref);

      return {
        name: file.name,
        url: downloadUrl,
        path: storagePath,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.warn("Firebase storage upload error, falling back to local data URL:", err.message);
    }
  }

  // Fallback: generate a persistent Data URL for preview if Storage bucket is not enabled yet
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        name: file.name,
        url: reader.result,
        path: storagePath,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      });
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
