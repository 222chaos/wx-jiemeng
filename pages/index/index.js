Page({
  data: {
    dream: '',
    result: '',
    loading: false,
    loadingText: '正在解梦...'
  },

  onInput(e) {
    this.setData({
      dream: e.detail.value,
    });
  },

  async onSubmit() {
    const { dream } = this.data;
    if (!dream.trim()) {
      wx.showToast({ title: '请输入梦境', icon: 'none' });
      return;
    }

    const loadingTexts = [
      'Loading...',
      '正在询问周公...',
      '正在翻阅梦书...',
      '好运正在路上...',
      'Loading 101% ...',
      '慢工出细活，久久方为功...',
      '周公正在解读梦境，请稍候...',
      '加载中，请稍候...',
      '卖力加载中...',
      'O.o ...',
      '马上就要写完咯...',
    ];
    const randomIndex = Math.floor(Math.random() * loadingTexts.length);
    
    this.setData({ 
      loading: true, 
      result: '',
      loadingText: loadingTexts[randomIndex]
    });

    const task = wx.request({
      url: 'https://zgjm-api-theta.vercel.app/api/ds-zgjm',
      method: 'POST',
      enableChunked: true,
      header: {
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({ dream }),

      success: (res) => {
        console.log('完整响应 success:', res);
      },

      fail: (err) => {
        console.error('请求失败:', err);
        wx.showToast({ title: '请求失败', icon: 'none' });
      },

      complete: () => {
        this.setData({ loading: false });
      }
    });

    if (task && task.onChunkReceived) {
      task.onChunkReceived((chunk) => {
        try {
          if (chunk && chunk.data instanceof ArrayBuffer) {
            const decoder = new TextDecoder('utf-8');
            const text = decoder.decode(chunk.data);
            this.setData({
              result: this.data.result + text,
            });
          } else {
            console.warn('未知的chunk结构:', chunk);
          }
        } catch (error) {
          console.error('处理chunk时出错:', error);
        }
      });
    } else {
      console.warn('当前环境不支持 onChunkReceived');
    }
  }
});