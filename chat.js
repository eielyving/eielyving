class AIChat {
    constructor() {
        this.createChatUI();
        this.setupEventListeners();
        this.messages = [];
        this.isFirstScroll = true;
        this.isProcessing = false;
        // 生成会话ID
        this.sessionId = Date.now().toString();
    }

    createChatUI() {
        const chatHTML = `
            <div class="chat-container">
                <div class="chat-header">
                    <div class="chat-title">AI Assistant</div>
                    <div class="chat-close">×</div>
                </div>
                <div class="chat-messages"></div>
                <div class="chat-input">
                    <input type="text" placeholder="输入消息..." />
                    <button>发送</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', chatHTML);
        
        this.container = document.querySelector('.chat-container');
        this.messagesContainer = this.container.querySelector('.chat-messages');
        this.input = this.container.querySelector('input');
        this.sendButton = this.container.querySelector('button');
        this.closeButton = this.container.querySelector('.chat-close');
    }

    setupEventListeners() {
        // 修改滚轮事件监听
        window.addEventListener('wheel', (e) => {
            if (e.deltaY > 0 && this.isFirstScroll) {
                this.showChat();
                this.isFirstScroll = false;
            }
        });

        // 发送消息
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // 修改关闭按钮行为
        this.closeButton.addEventListener('click', () => {
            this.hideChat();
            // 允许再次打开
            setTimeout(() => {
                this.isFirstScroll = true;
            }, 500);
        });

        // 添加快捷键
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideChat();
                setTimeout(() => {
                    this.isFirstScroll = true;
                }, 500);
            }
        });
    }

    showChat() {
        this.container.classList.add('active');
        if (this.messages.length === 0) {
            this.addMessage("你好！我是你的AI助手。有什么我可以帮你的吗？", 'ai');
        }
    }

    hideChat() {
        this.container.classList.remove('active');
    }

    addMessage(text, type) {
        const message = document.createElement('div');
        message.className = `message ${type}`;
        
        // 支持 Markdown 链接格式
        if (text.includes('](')) {
            text = text.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
            message.innerHTML = text;
        } else {
            message.textContent = text;
        }
        
        this.messagesContainer.appendChild(message);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        this.messages.push({ role: type === 'user' ? 'user' : 'assistant', content: text });
    }

    async sendMessage() {
        if (this.isProcessing) return;
        
        const text = this.input.value.trim();
        if (!text) return;

        this.addMessage(text, 'user');
        this.input.value = '';
        
        // 禁用输入
        this.isProcessing = true;
        this.input.disabled = true;
        this.sendButton.disabled = true;

        try {
            const response = await fetch('/api/chat/completion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    messages: this.messages
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // 检查是否是流式响应
            if (response.headers.get('content-type')?.includes('text/event-stream')) {
                let message = '';
                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data === '[DONE]') continue;
                            
                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.choices?.[0]?.delta?.content) {
                                    message += parsed.choices[0].delta.content;
                                    // 更新现有消息
                                    const lastMessage = this.messagesContainer.lastElementChild;
                                    if (lastMessage?.classList.contains('ai')) {
                                        if (message.includes('](')) {
                                            lastMessage.innerHTML = message.replace(
                                                /\[([^\]]+)\]\(([^\)]+)\)/g, 
                                                '<a href="$2" target="_blank">$1</a>'
                                            );
                                        } else {
                                            lastMessage.textContent = message;
                                        }
                                    } else {
                                        this.addMessage(message, 'ai');
                                    }
                                }
                            } catch (e) {
                                console.error('Error parsing SSE message:', e);
                            }
                        }
                    }
                }
                
                if (message) {
                    this.messages.push({ role: 'assistant', content: message });
                }
            } else {
                const data = await response.json();
                this.addMessage(data.choices[0].message.content, 'ai');
            }
        } catch (error) {
            console.error('Error:', error);
            this.addMessage('抱歉，发生了一些错误，请稍后重试。', 'ai');
        } finally {
            // 恢复输入
            this.isProcessing = false;
            this.input.disabled = false;
            this.sendButton.disabled = false;
            this.input.focus();
        }
    }

    // 在 AIChat 类中添加文件处理方法
    async handleFileUpload(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const response = await fetch('/api/chat/upload', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('File upload failed');
            }
            
            const data = await response.json();
            return data.fileId;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }
}

// 初始化聊天
document.addEventListener('DOMContentLoaded', () => {
    new AIChat();
}); 