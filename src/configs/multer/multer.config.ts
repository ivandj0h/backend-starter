import multer from 'multer';

/**
 * Konfigurasi multer untuk menerima hanya file JPEG & PNG.
 */
export const multerUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // max 5MB
    },
    fileFilter: (req, file, cb) => {
        const isValid = /^image\/(jpeg|png)$/.test(file.mimetype);
        if (!isValid) {
            return cb(new Error('Only JPEG and PNG files are allowed') as any, false);
        }
        cb(null, true);
    }
});
