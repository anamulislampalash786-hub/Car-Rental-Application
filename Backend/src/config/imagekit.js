import ImageKit from "@imagekit/nodejs";
import config from "./env.js";

const imageKit = new ImageKit({
    privateKey: config.IMAGEKIT_PRIVATE_KEY,
});

export const uploadFile = async (file) => {
    try {
        const result = await imageKit.files.upload({
            file: file.buffer.toString("base64"),
            fileName: `${Date.now()}-${file.originalname}`,
            folder: "/cars",
        });
        return { url: result.url, fileId: result.fileId };
    } catch (error) {
        console.error("ImageKit upload error:", error);
        throw error;
    }
};

export const deleteFile = async (fileId) => {
    try {
        await imageKit.files.deleteFile(fileId);
    } catch (error) {
        console.error("ImageKit delete error:", error);
        throw error;
    }
};