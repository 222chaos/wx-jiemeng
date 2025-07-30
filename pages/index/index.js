Page({
  data: {
    dream: '',
    result: '',
    loading: false,
    loadingText: '正在解梦...',
    resultVisible: false
  },

  // 输入处理 - 添加防抖优化
  onInput(e) {
    const value = e.detail.value;
    this.setData({
      dream: value,
    });
    
    // 清除之前的结果（当用户重新输入时）
    if (this.data.result) {
      this.setData({
        result: '',
        resultVisible: false
      });
    }
  },

  // 提交处理 - 增强错误处理和用户体验
  async onSubmit() {
    const { dream } = this.data;
    
    // 输入验证
    if (!dream.trim()) {
      wx.showToast({ 
        title: '请输入梦境内容', 
        icon: 'none',
        duration: 2000
      });
      return;
    }

    if (dream.trim().length < 5) {
      wx.showToast({ 
        title: '请输入更详细的梦境描述', 
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 随机加载文案
    const loadingTexts = [
      '正在连接周公...',
      '正在翻阅古籍...',
      '解梦大师思考中...',
      '好运正在路上...',
      '慢工出细活，久久方为功...',
      '周公正在解读梦境，请稍候...',
      '古人云：日有所思，夜有所梦...',
      '卖力解析中...',
      '梦境解码进行中...',
      '穿越时空咨询中...',
      '马上就要完成了...',
    ];
    
    const randomIndex = Math.floor(Math.random() * loadingTexts.length);
    
    this.setData({ 
      loading: true, 
      result: '',
      resultVisible: false,
      loadingText: loadingTexts[randomIndex]
    });

    // 添加超时处理
    const timeoutId = setTimeout(() => {
      if (this.data.loading) {
        this.setData({ loading: false });
        wx.showToast({
          title: '请求超时，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    }, 30000); // 30秒超时

    try {
      const task = wx.request({
        url: 'https://zgjm-api-theta.vercel.app/api/ds-zgjm',
        method: 'POST',
        enableChunked: true,
        timeout: 30000,
        header: {
          'Content-Type': 'application/json',
        },
        data: JSON.stringify({ dream: dream.trim() }),

        success: (res) => {
          clearTimeout(timeoutId);
          console.log('请求成功:', res);
          
          // 如果不支持流式，处理完整响应
          if (res.data && typeof res.data === 'string') {
            this.setData({
              result: res.data,
              resultVisible: true
            });
          }
        },

        fail: (err) => {
          clearTimeout(timeoutId);
          console.error('请求失败:', err);
          
          let errorMsg = '网络连接失败，请检查网络后重试';
          if (err.errMsg.includes('timeout')) {
            errorMsg = '请求超时，请重试';
          } else if (err.errMsg.includes('404')) {
            errorMsg = '服务暂时不可用';
          }
          
          wx.showToast({ 
            title: errorMsg, 
            icon: 'none',
            duration: 3000
          });
        },

        complete: () => {
          clearTimeout(timeoutId);
          this.setData({ loading: false });
        }
      });

      // 处理流式响应
      if (task && task.onChunkReceived) {
        task.onChunkReceived((chunk) => {
          try {
            if (chunk && chunk.data instanceof ArrayBuffer) {
              const decoder = new TextDecoder('utf-8');
              const text = decoder.decode(chunk.data);
              
              // 优化显示效果，逐字显示
              this.setData({
                result: this.data.result + text,
                resultVisible: true
              });
              
              // 自动滚动到结果区域
              if (!this.scrolledToResult) {
                wx.pageScrollTo({
                  selector: '.result',
                  duration: 300
                });
                this.scrolledToResult = true;
              }
            }
          } catch (error) {
            console.error('处理chunk时出错:', error);
          }
        });
      }
      
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('请求异常:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '请求出现异常',
        icon: 'none',
        duration: 2000
      });
    }

    // 重置滚动标记
    this.scrolledToResult = false;
  },

  // 清空输入
  onClear() {
    this.setData({
      dream: '',
      result: '',
      resultVisible: false
    });
  },

  // 复制结果
  onCopyResult() {
    if (!this.data.result) {
      wx.showToast({
        title: '暂无内容可复制',
        icon: 'none'
      });
      return;
    }

    wx.setClipboardData({
      data: this.data.result,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        });
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'none'
        });
      }
    });
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '周公解梦 - 解读你的梦境奥秘',
      path: '/pages/index/index',
      imageUrl: '/static/share.png' // 需要添加分享图片
    };
  }
});