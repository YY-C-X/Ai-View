// 监听扩展安装事件
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// 使用异步消息处理
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request);
  
  if (request.type === 'apiRequest') {
    fetch('http://127.0.0.1:11434/api/chat', {  // 改用 chat 端点
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "deepseek-r1:1.5b",
        messages: [{  // 使用 messages 格式
          role: "user",
          content: request.message
        }],
        stream: false
      })
    })
    .then(async response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // 先获取文本并检查
      const text = await response.text();
      console.log('Raw response:', text);
      
      // 确保文本不为空且是有效的 JSON
      if (text && text.trim()) {
        const data = JSON.parse(text);
        console.log('API Response data:', data);
        chrome.runtime.sendMessage({ 
          type: 'apiResponse', 
          data: data 
        });
      } else {
        throw new Error('Empty response from server');
      }
    })
    .catch(error => {
      console.error('API Error:', error);
      chrome.runtime.sendMessage({ 
        type: 'apiError', 
        error: error.message 
      });
    });

    return true;
  }
});