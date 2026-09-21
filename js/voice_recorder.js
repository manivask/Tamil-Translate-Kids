/**
 * Tamil-Translate-Kids - Kid Voice Recorder & Voice Dataset Collector
 * Captures raw audio waveforms via MediaRecorder for dataset analysis in `input_voice_data/`
 * Works reliably across iOS (iPhone/iPad Safari/Chrome), Android, and Desktop.
 */

const KidVoiceRecorder = {
  mediaRecorder: null,
  audioChunks: [],
  stream: null,
  isRecording: false,
  storageKey: "tamil_kids_voice_samples",
  maxSamples: 100,
  supportedMimeType: null,

  init() {
    this.detectSupportedMimeType();
  },

  detectSupportedMimeType() {
    if (typeof MediaRecorder === "undefined") return;
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/aac",
      "audio/ogg"
    ];
    for (const t of types) {
      if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) {
        this.supportedMimeType = t;
        break;
      }
    }
  },

  async startRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn("getUserMedia not supported on this browser");
      return false;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.audioChunks = [];
      const options = this.supportedMimeType ? { mimeType: this.supportedMimeType } : {};
      this.mediaRecorder = new MediaRecorder(this.stream, options);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // 100ms slices
      this.isRecording = true;
      return true;
    } catch (err) {
      console.warn("Failed to start MediaRecorder:", err);
      this.isRecording = false;
      return false;
    }
  },

  async stopRecording(metadata = {}) {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === "inactive") {
        this.isRecording = false;
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const mime = this.supportedMimeType || "audio/webm";
          const audioBlob = new Blob(this.audioChunks, { type: mime });
          const audioUrl = URL.createObjectURL(audioBlob);
          const base64 = await this.blobToBase64(audioBlob);

          const sampleEntry = {
            id: "voice_" + Date.now().toString(36) + "_" + Math.random().toString(36).substr(2, 4),
            timestamp: new Date().toISOString(),
            mimeType: mime,
            sizeBytes: audioBlob.size,
            durationEstimateSec: Math.round(audioBlob.size / 4000),
            audioBase64: base64,
            ...metadata
          };

          // Save to client storage
          this.saveSample(sampleEntry);

          if (window.KidAppLogger) {
            KidAppLogger.log("VOICE", "Voice sample recorded and saved", {
              voiceId: sampleEntry.id,
              sizeBytes: sampleEntry.sizeBytes,
              mimeType: sampleEntry.mimeType
            });
          }

          this.cleanup();
          resolve({ sampleEntry, audioUrl, audioBlob });
        } catch (e) {
          console.warn("Error processing audio recording:", e);
          this.cleanup();
          resolve(null);
        }
      };

      try {
        this.mediaRecorder.stop();
      } catch (e) {
        this.cleanup();
        resolve(null);
      }
    });
  },

  cleanup() {
    this.isRecording = false;
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  },

  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },

  saveSample(sample) {
    try {
      const samples = this.getSavedSamples();
      samples.unshift(sample);
      if (samples.length > this.maxSamples) samples.pop();
      localStorage.setItem(this.storageKey, JSON.stringify(samples));
    } catch (e) {
      console.warn("LocalStorage full, trimming voice samples", e);
      try {
        const trimmed = this.getSavedSamples().slice(0, 10);
        localStorage.setItem(this.storageKey, JSON.stringify(trimmed));
      } catch (err) {}
    }
  },

  getSavedSamples() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  clearSavedSamples() {
    localStorage.removeItem(this.storageKey);
  },

  exportDatasetJSON() {
    const samples = this.getSavedSamples();
    const bundle = {
      exportedAt: new Date().toISOString(),
      folderTarget: "input_voice_data",
      totalVoiceSamples: samples.length,
      samples
    };
    return JSON.stringify(bundle, null, 2);
  },

  downloadDataset() {
    const jsonStr = this.exportDatasetJSON();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `input_voice_data_bundle_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

if (typeof window !== "undefined") {
  window.KidVoiceRecorder = KidVoiceRecorder;
}
