class AIChat {
    constructor() {
        this.createChatUI();
        this.setupEventListeners();
        this.messages = [];
        this.isFirstScroll = true;
        this.isProcessing = false;
        this.API_KEY = 'sk-oXP6pBlE4gG0w6yzjdnkz1QYF68ajOtbTfewwwGprTxJsR8v';
        this.API_URL = 'https://cors-anywhere.herokuapp.com/https://api.moonshot.cn/v1/chat/completions';
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
        window.addEventListener('wheel', (e) => {
            if (e.deltaY > 0 && this.isFirstScroll) {
                this.showChat();
                this.isFirstScroll = false;
            }
        });

        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        this.closeButton.addEventListener('click', () => {
            this.hideChat();
            setTimeout(() => {
                this.isFirstScroll = true;
            }, 500);
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
        
        this.isProcessing = true;
        this.input.disabled = true;
        this.sendButton.disabled = true;

        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.API_KEY}`,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    model: 'moonshot-v1-32k',
                    messages: [{
                        role: 'system',
                        content: '你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。'
                    }, {
                        role: 'user',
                        content: text
                    }],
                    stream: true,
                    temperature: 0.3
                }),
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const aiMessage = document.createElement('div');
            aiMessage.className = 'message ai';
            this.messagesContainer.appendChild(aiMessage);
            let fullMessage = '';

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();
                        if (!data || data === '[DONE]') continue;
                        
                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.choices?.[0]?.delta?.content) {
                                const content = parsed.choices[0].delta.content;
                                fullMessage += content;
                                
                                if (fullMessage.includes('](')) {
                                    aiMessage.innerHTML = fullMessage.replace(
                                        /\[([^\]]+)\]\(([^\)]+)\)/g, 
                                        '<a href="$2" target="_blank">$1</a>'
                                    );
                                } else {
                                    aiMessage.textContent = fullMessage;
                                }
                                
                                this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
                            }
                        } catch (e) {
                            if (data && data !== '[DONE]') {
                                console.error('Error parsing SSE message:', e, 'Data:', data);
                            }
                        }
                    }
                }
            }
            
            if (fullMessage) {
                this.messages.push({ role: 'assistant', content: fullMessage });
            }

        } catch (error) {
            console.error('Error:', error);
            this.addMessage('抱歉，发生了一些错误：' + error.message, 'ai');
        } finally {
            this.isProcessing = false;
            this.input.disabled = false;
            this.sendButton.disabled = false;
            this.input.focus();
        }
    }
}

// 初始化聊天
document.addEventListener('DOMContentLoaded', () => {
    new AIChat();
}); 