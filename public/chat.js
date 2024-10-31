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
        // 使用完整的 URL
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

        // ... 其余代码保持不变 ...
    } catch (error) {
        console.error('Error:', error);
        this.addMessage('抱歉，发生了一些错误，请稍后重试。', 'ai');
    } finally {
        this.isProcessing = false;
        this.input.disabled = false;
        this.sendButton.disabled = false;
        this.input.focus();
    }
} 