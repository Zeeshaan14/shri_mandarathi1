import ImageKit from "imagekit";
import dotenv from "dotenv";
dotenv.config();
const { IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT } = process.env;
export const IMAGEKIT_ENABLED = Boolean(IMAGEKIT_PUBLIC_KEY &&
    IMAGEKIT_PRIVATE_KEY &&
    IMAGEKIT_URL_ENDPOINT);
let imagekit = null;
if (IMAGEKIT_ENABLED) {
    console.log('🖼️ ImageKit configuration detected, initializing...');
    imagekit = new ImageKit({
        publicKey: IMAGEKIT_PUBLIC_KEY,
        privateKey: IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: IMAGEKIT_URL_ENDPOINT,
    });
    console.log('✅ ImageKit initialized successfully');
}
else {
    console.log('💾 ImageKit not configured, using local storage');
}
export default imagekit;
// Utility function to test ImageKit connectivity
export const testImageKitConnection = async () => {
    if (!IMAGEKIT_ENABLED || !imagekit) {
        console.log('💾 ImageKit not enabled');
        return false;
    }
    try {
        // Test by getting file list (empty folder)
        const result = await imagekit.listFiles({
            path: '/test',
            limit: 1
        });
        console.log('✅ ImageKit connection successful');
        return true;
    }
    catch (error) {
        console.error('❌ ImageKit connection failed:', error.message);
        return false;
    }
};
// Utility function to get ImageKit status
export const getImageKitStatus = () => {
    return {
        enabled: IMAGEKIT_ENABLED,
        hasPublicKey: Boolean(IMAGEKIT_PUBLIC_KEY),
        hasPrivateKey: Boolean(IMAGEKIT_PRIVATE_KEY),
        hasUrlEndpoint: Boolean(IMAGEKIT_URL_ENDPOINT),
        urlEndpoint: IMAGEKIT_URL_ENDPOINT,
    };
};
// Utility function to upload file to ImageKit
export const uploadToImageKit = async (fileBuffer, fileName, folder = 'products', timeoutMs = 30000) => {
    if (!IMAGEKIT_ENABLED || !imagekit) {
        throw new Error('ImageKit not configured');
    }
    console.log(`🚀 Starting ImageKit upload: ${fileName} to folder: ${folder}`);
    try {
        const uploadPromise = imagekit.upload({
            file: fileBuffer,
            fileName: fileName,
            folder: folder,
            useUniqueFileName: true,
            responseFields: ['url', 'fileId', 'name', 'size', 'height', 'width'],
        });
        const timeoutPromise = new Promise((_, reject) => {
            const id = setTimeout(() => {
                clearTimeout(id);
                reject(new Error(`ImageKit upload timed out after ${timeoutMs}ms`));
            }, timeoutMs);
        });
        const result = await Promise.race([uploadPromise, timeoutPromise]);
        console.log(`✅ ImageKit upload successful: ${result.url}`);
        return {
            url: result.url,
            fileId: result.fileId
        };
    }
    catch (error) {
        console.error('❌ ImageKit upload failed:', error.message);
        throw error;
    }
};
//# sourceMappingURL=imagekit.js.map