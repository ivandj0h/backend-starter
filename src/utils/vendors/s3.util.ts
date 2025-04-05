import { PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import { s3 } from '@/configs/aws/s3.config';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload file ke S3 dengan mekanisme retry
 * @param buffer isi file dalam bentuk buffer
 * @param originalName nama file asli
 * @returns URL file yang berhasil diupload ke S3
 */
export const uploadToS3 = async (
    buffer: Buffer,
    originalName: string
): Promise<string> => {
    const extension = path.extname(originalName);
    const key = `avatars/${uuidv4()}${extension}`;
    const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    const params: PutObjectCommandInput = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: getMimeType(extension),
        // ACL: 'public-read',
    };

    let attempt = 0;
    const maxRetries = 3;

    while (attempt < maxRetries) {
        try {
            await s3.send(new PutObjectCommand(params));
            return url; // upload sukses
        } catch (error: any) {
            attempt++;
            console.error(`S3 upload attempt ${attempt} failed:`, error.message);

            // Jika sudah 3x coba, lempar error
            if (attempt >= maxRetries) {
                throw new Error('Upload to S3 failed after 3 attempts');
            }
        }
    }

    // fallback just in case
    throw new Error('Unknown error during S3 upload');
};

function getMimeType(ext: string): string {
    switch (ext.toLowerCase()) {
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        default:
            return 'application/octet-stream';
    }
}
