import { Router, Request, Response } from 'express';
import chatController from '../controllers/chat';

const router = Router();

router.post('/completion', async (req: Request, res: Response) => {
    try {
        if (!process.env.KIMI_TOKEN) {
            throw new Error('KIMI_TOKEN not found in environment variables');
        }

        const { messages, sessionId } = req.body;
        
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid messages format'
            });
        }

        // 创建流式响应
        const stream = await chatController.createCompletionStream(
            'kimi',
            messages,
            process.env.KIMI_TOKEN,
            true,
            sessionId
        );

        // 设置响应头
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // 将流传输到客户端
        stream.pipe(res);

        // 监听流结束
        stream.on('end', () => {
            res.end();
        });

        // 监听错误
        stream.on('error', (error: Error) => {
            console.error('Stream error:', error);
            res.end();
        });

    } catch (error: any) {
        console.error('Chat completion error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message || 'Unknown error occurred'
        });
    }
});

export default router; 