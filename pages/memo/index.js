Page({
  data: {
    input: '',
    notes: []
  },

  onLoad() {
    const stored = wx.getStorageSync('memos') || [];
    this.setData({ notes: stored });
  },

  onInput(e) {
    this.setData({ input: e.detail.value });
  },

  addMemo() {
    const { input, notes } = this.data;
    const trimmed = input.trim();
    if (!trimmed) return;

    const newNotes = [...notes, { text: trimmed, time: new Date().toLocaleString() }];
    this.setData({ notes: newNotes, input: '' });
    wx.setStorageSync('memos', newNotes);
  },

  deleteMemo(e) {
    const index = e.currentTarget.dataset.index;
    const notes = this.data.notes;
    notes.splice(index, 1);
    this.setData({ notes });
    wx.setStorageSync('memos', notes);
  }
});
