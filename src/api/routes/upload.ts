import { Router } from 'express';
import type { Request, Response } from 'express';
import multer from 'multer';
import { ChatController } from '../controllers/ChatController';

// 定义上传文件的请求类型
interface FileRequest extends Request {
    file?: {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        destination: string;
        filename: string;
        path: string;
        size: number;
    };
}

const router = Router();
const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB
    }
});

const chatController = new ChatController();

router.post('/upload', upload.single('file'), async (req: FileRequest, res: Response) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: '没有文件上传' });
        }
        
        const result = await chatController.handleFileUpload(file);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: '文件上传失败' });
    }
});

export default router; 