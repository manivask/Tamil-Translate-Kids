/**
 * Tamil-Translate-Kids - Client Activity & Diagnostics Logger
 * Captures user interactions, speech recognition events, and device telemetry
 * for performance optimization and debugging across mobile and desktop devices.
 */

const KidAppLogger = {
  storageKey: "tamil_kids_activity_logs",
  maxLogs: 200,

  getDeviceInfo() {
    const ua = navigator.userAgent;
    let device = "Desktop";
    if (/iPhone|iPad|iPod/i.test(ua)) device = "iOS / iPhone";
    else if (/Android/i.test(ua)) device = "Android";
    else if (/Mac/i.test(ua)) device = "macOS";
    else if (/Win/i.test(ua)) device = "Windows";

    return {
      device,
      userAgent: ua,
      screen: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language || "unknown",
      speechRecognitionSupported: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
      speechSynthesisSupported: !!window.speechSynthesis
    };
  },

  log(category, action, details = {}) {
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      category, // 'NAV' | 'VOICE' | 'MATCH' | 'TTS' | 'ERROR' | 'INIT'
      action,
      details,
      device: this.getDeviceInfo().device
    };

    console.log(`[TamilKidsLog][${category}] ${action}`, details);

    try {
      const logs = this.getLogs();
      logs.unshift(entry);
      if (logs.length > this.maxLogs) logs.pop();
      localStorage.setItem(this.storageKey, JSON.stringify(logs));
    } catch (e) {
      console.warn("Storage log warning:", e);
    }

    return entry;
  },

  getLogs() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  clearLogs() {
    localStorage.removeItem(this.storageKey);
  },

  exportLogsAsJSON() {
    const logs = this.getLogs();
    const data = {
      exportedAt: new Date().toISOString(),
      deviceInfo: this.getDeviceInfo(),
      totalEntries: logs.length,
      logs
    };
    return JSON.stringify(data, null, 2);
  },

  downloadLogs() {
    const jsonStr = this.exportLogsAsJSON();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tamil_kids_logs_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

if (typeof window !== "undefined") {
  window.KidAppLogger = KidAppLogger;
}
