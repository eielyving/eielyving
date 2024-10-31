import { Request } from 'express';

interface UploadedFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    destination: string;
    filename: string;
    path: string;
    size: number;
}

export class ChatController {
    public async handleFileUpload(file: UploadedFile) {
        try {
            return { 
                success: true, 
                message: '文件上传成功',
                filename: file.filename,
                originalname: file.originalname
            };
        } catch (error) {
            throw new Error('文件上传失败');
        }
    }
} 