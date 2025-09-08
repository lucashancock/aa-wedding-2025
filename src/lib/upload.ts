import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { storage, db } from "@/lib/firebase"; // <- your initialized Firebase

/**
 * Uploads an array of files to Firebase Storage
 * and saves metadata in Firestore.
 */
export async function uploadFiles(
  files: File[],
  userId: string
): Promise<void> {
  if (!files || files.length === 0) return;

  // 1. Map each file to an async upload task
  const uploadTasks = files.map(async (file) => {
    const storageRef = ref(
      storage,
      `uploads/${userId}/${Date.now()}_${file.name}`
    );

    // Upload file to Firebase Storage
    await uploadBytes(storageRef, file);

    // Get public download URL
    const downloadURL = await getDownloadURL(storageRef);

    // Save metadata to Firestore
    await addDoc(collection(db, "files"), {
      userId,
      name: file.name,
      type: file.type,
      size: file.size,
      url: downloadURL,
      createdAt: serverTimestamp(),
    });

    return downloadURL;
  });

  // 2. Wait for all uploads to finish
  await Promise.all(uploadTasks);
}
