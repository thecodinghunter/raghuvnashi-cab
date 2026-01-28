import {
  FirebaseStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

/**
 * Uploads a file to a specified path in Firebase Storage.
 *
 * @param storage The FirebaseStorage instance.
 * @param file The file to upload.
 * @param path The path in Firebase Storage where the file should be stored.
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export async function uploadFile(
  storage: FirebaseStorage,
  file: File,
  path: string
): Promise<string> {
  if (!storage) {
    throw new Error('Firebase Storage instance is not available. Ensure Firebase is initialized correctly.');
  }
  if (!file) {
    throw new Error('No file provided for upload.');
  }
  if (!path) {
    throw new Error('Upload path is not specified.');
  }

  // Create a storage reference with a unique path
  const storageRef = ref(storage, path);

  try {
    // 'file' comes from the Blob or File API
    const snapshot = await uploadBytes(storageRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file and get download URL.');
  }
}
