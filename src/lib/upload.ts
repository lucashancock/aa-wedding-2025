import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, storage } from "./firebase";

export const handleUpload = async (file: File, userId: string) => {
  if (!file) throw new Error("No file provided for upload.");

  // Create a storage reference
  const storageRef = ref(
    storage,
    `uploads/${userId}/${Date.now()}_${file.name}`
  );

  // Upload the file to Firebase Storage
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);

  // Save file metadata to Firestore
  const fileData = {
    url: downloadURL,
    type: file.type,
    createdAt: serverTimestamp(),
    uploadedBy: userId,
  };
  await addDoc(collection(db, "uploads"), fileData);

  return downloadURL;
};
