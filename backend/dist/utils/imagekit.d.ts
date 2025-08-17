import ImageKit from "imagekit";
export declare const IMAGEKIT_ENABLED: boolean;
declare let imagekit: ImageKit | null;
export default imagekit;
export declare const testImageKitConnection: () => Promise<boolean>;
export declare const getImageKitStatus: () => {
    enabled: boolean;
    hasPublicKey: boolean;
    hasPrivateKey: boolean;
    hasUrlEndpoint: boolean;
    urlEndpoint: string | undefined;
};
export declare const uploadToImageKit: (fileBuffer: Buffer, fileName: string, folder?: string, timeoutMs?: number) => Promise<{
    url: string;
    fileId: string;
}>;
//# sourceMappingURL=imagekit.d.ts.map