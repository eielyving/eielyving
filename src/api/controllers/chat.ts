import { Request, Response } from 'express';
import { PassThrough } from 'stream';
import path from 'path';
import _ from 'lodash';
import mime from 'mime';
import axios, { AxiosResponse } from 'axios';
import { createParser } from 'eventsource-parser';
import FormData from 'form-data';
import fs from 'fs';
import APIException from '@/lib/exceptions/APIException';
import EX from '@/api/consts/exceptions';
import logger from '@/lib/logger';
import util from '@/lib/util';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface TokenInfo {
    userId: string;
    accessToken: string;
    refreshToken: string;
    refreshTime: number;
}

class ChatController {
    private conversations: Map<string, any[]> = new Map();

    // 创建流式对话补全
    public async createCompletionStream(
        model: string,
        messages: any[],
        token: string,
        useSearch: boolean = true,
        sessionId?: string
    ) {
        try {
            console.log('Sending request with token:', token);
            console.log('Sending request with messages:', JSON.stringify(messages, null, 2));

            const response = await axios.post('https://api.moonshot.cn/v1/chat/completions', {
                model: 'moonshot-v1-32k',
                messages: messages,
                stream: true,
                temperature: 0.3
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'stream'
            });

            // 创建转换流
            const transStream = new PassThrough();

            // 处理流数据
            const parser = createParser((event: any) => {
                if (event.type === 'event') {
                    try {
                        if (event.data === '[DONE]') {
                            transStream.write('data: [DONE]\n\n');
                            return;
                        }

                        const data = JSON.parse(event.data);
                        console.log('Received data:', data);

                        if (data.choices?.[0]?.delta?.content) {
                            const chunk = `data: ${JSON.stringify({
                                id: sessionId || 'chat-' + Date.now(),
                                model: 'moonshot-v1-32k',
                                choices: [{
                                    delta: { content: data.choices[0].delta.content },
                                    index: 0,
                                    finish_reason: null
                                }],
                                object: 'chat.completion.chunk'
                            })}\n\n`;
                            transStream.write(chunk);
                        }
                    } catch (error) {
                        console.error('Error parsing SSE message:', error);
                    }
                }
            });

            // 处理响应流
            response.data.on('data', (chunk: Buffer) => {
                try {
                    const text = chunk.toString();
                    console.log('Raw chunk:', text);
                    parser.feed(text);
                } catch (error) {
                    console.error('Error processing chunk:', error);
                }
            });

            response.data.on('end', () => {
                console.log('Stream ended');
                transStream.write('data: [DONE]\n\n');
                transStream.end();
            });

            response.data.on('error', (error: Error) => {
                console.error('Stream error:', error);
                transStream.write(`data: ${JSON.stringify({
                    error: true,
                    message: error.message
                })}\n\n`);
                transStream.end();
            });

            return transStream;

        } catch (error: any) {
            console.error('Chat completion error:', error.response?.data || error.message);
            const transStream = new PassThrough();
            transStream.write(`data: ${JSON.stringify({
                id: sessionId || 'chat-' + Date.now(),
                model: 'moonshot-v1-32k',
                choices: [{
                    delta: { content: '抱歉，发生了一些错误：' + (error.response?.data?.message || error.message) },
                    index: 0,
                    finish_reason: 'error'
                }],
                object: 'chat.completion.chunk'
            })}\n\n`);
            transStream.write('data: [DONE]\n\n');
            transStream.end();
            return transStream;
        }
    }

    // 初始化新的对话
    public initializeChat = (req: Request, res: Response) => {
        const sessionId = req.body.sessionId || Date.now().toString();
        
        if (!this.conversations.has(sessionId)) {
            this.conversations.set(sessionId, []);
        }

        res.json({
            success: true,
            sessionId,
            message: "聊天会话已初始化"
        });
    }

    // 发送消息并获取回复
    public sendMessage = async (req: Request, res: Response) => {
        try {
            const { sessionId, message } = req.body;

            if (!sessionId || !message) {
                return res.status(400).json({
                    success: false,
                    message: "缺少必要参数"
                });
            }

            // 获取或创建对话历史
            let conversation = this.conversations.get(sessionId) || [];

            // 添加用户消息
            conversation.push({
                role: 'user',
                content: message
            });

            // 模拟AI处理延迟
            const response = await this.generateResponse(message, conversation);

            // 添加AI回复
            conversation.push({
                role: 'assistant',
                content: response
            });

            // 更新对话历史
            this.conversations.set(sessionId, conversation);

            res.json({
                success: true,
                response,
                conversation
            });

        } catch (error) {
            console.error('Chat error:', error);
            res.status(500).json({
                success: false,
                message: "处理消息时发生错误"
            });
        }
    }

    // 获取对话历史
    public getHistory = (req: Request, res: Response) => {
        const { sessionId } = req.params;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: "缺少话ID"
            });
        }

        const conversation = this.conversations.get(sessionId) || [];

        res.json({
            success: true,
            conversation
        });
    }

    // 清除对话历史
    public clearHistory = (req: Request, res: Response) => {
        const { sessionId } = req.params;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: "缺少会话ID"
            });
        }

        this.conversations.delete(sessionId);

        res.json({
            success: true,
            message: "对话历史已清除"
        });
    }

    // 模拟AI响应生成
    private generateResponse = async (
        message: string, 
        conversation: ChatMessage[]
    ): Promise<string> => {
        // 这里可以集成实际的AI服务
        const responses = [
            "我理解你的问题，让我想想...",
            "这是一个很好的问题！",
            "让我为你解答这个问题。",
            "我们可以这样思考这个问题...",
            "这个问题很有趣，我的建议是..."
        ];

        // 模拟处理延迟
        await new Promise(resolve => setTimeout(resolve, 1000));

        return responses[Math.floor(Math.random() * responses.length)];
    }

    // 上传文件到 Moonshot API
    private async uploadFile(filePath: string): Promise<string> {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));
        formData.append('purpose', 'file-extract');

        const response = await axios.post('https://api.moonshot.cn/v1/files', formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${process.env.KIMI_TOKEN}`
            }
        });

        return response.data.id;
    }

    // 获取文件内容
    private async getFileContent(fileId: string): Promise<string> {
        const response = await axios.get(`https://api.moonshot.cn/v1/files/${fileId}/content`, {
            headers: {
                'Authorization': `Bearer ${process.env.KIMI_TOKEN}`
            }
        });

        return response.data.text;
    }

    // 处理消息中的文件
    private async processMessages(messages: any[]): Promise<any[]> {
        const processedMessages = [];

        for (const message of messages) {
            if (message.content && typeof message.content === 'object' && message.content.file) {
                // 上传文件
                const fileId = await this.uploadFile(message.content.file);
                // 获取文件内容
                const fileContent = await this.getFileContent(fileId);
                
                // 添加文件内容作为系统消息
                processedMessages.push({
                    role: 'system',
                    content: fileContent
                });
            } else {
                processedMessages.push(message);
            }
        }

        return processedMessages;
    }
}

export default new ChatController(); 