// src/stores/results.js
import { defineStore } from 'pinia'

export const useResultsStore = defineStore('results', {
  state: () => ({
    results: [],
    resultGroups: [],
    errorMsg: '',
  }),
  actions: {
    setResults(payload) {
      this.results = payload.results || []
      this.resultGroups = payload.resultGroups || []
      this.errorMsg = ''
    },
    setError(msg) {
      this.errorMsg = msg || 'เกิดข้อผิดพลาด'
    },
    $reset() {
      this.results = []
      this.resultGroups = []
      this.errorMsg = ''
    },
  },
})
