// const API_KEY = 'https://127.0.0.1:11434'; // 替换为您的 API 密钥
// // 移除不需要的 API_KEY
// const API_URL = 'https://127.0.0.1:11434/api/chat';

document.addEventListener('DOMContentLoaded', function() {
  const chatContainer = document.getElementById('chat-container');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');

  function addMessage(content, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    messageDiv.textContent = content;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  async function sendMessage(message) {
    try {
      // 设置消息监听器
      const responsePromise = new Promise((resolve, reject) => {
        const messageListener = (response) => {
          if (response.type === 'apiResponse') {
            chrome.runtime.onMessage.removeListener(messageListener);
            resolve(response.data);
          } else if (response.type === 'apiError') {
            chrome.runtime.onMessage.removeListener(messageListener);
            reject(new Error(response.error));
          }
        };
        chrome.runtime.onMessage.addListener(messageListener);
      });

      // 发送请求
      chrome.runtime.sendMessage({ type: 'apiRequest', message: message });

      // 等待响应
      const data = await responsePromise;
      return data.response;
    } catch (error) {
      console.error('具体错误:', error);
      return `请求错误: ${error.message}`;
    }
  }

  async function handleSendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    messageInput.value = '';
    messageInput.disabled = true;
    sendButton.disabled = true;

    const response = await sendMessage(message);
    addMessage(response, false);

    messageInput.disabled = false;
    sendButton.disabled = false;
    messageInput.focus();
  }

  sendButton.addEventListener('click', handleSendMessage);
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  });
});