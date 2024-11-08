import { create } from 'zustand';

export const useVoiceStore = create((set) => ({
  voiceSamples: [],
  selectedSample: null,
  selectedVoice: '', // 当前选中的音色

  addVoiceSample: (sample) =>
    set((state) => ({
      voiceSamples: [...state.voiceSamples, sample]
    })),

  removeVoiceSample: (id) =>
    set((state) => ({
      voiceSamples: state.voiceSamples.filter((s) => s.id !== id),
      selectedVoice: state.selectedVoice === id ? '' : state.selectedVoice
    })),

  setSelectedVoice: (id) =>
    set({
      selectedVoice: id
    }),

  updateVoiceSample: (id, updates) =>
    set((state) => ({
      voiceSamples: state.voiceSamples.map(sample =>
        sample.id === id ? { ...sample, ...updates } : sample
      )
    })),

  setSelectedSample: (sample) =>
    set({
      selectedSample: sample,
    }),

  setPlaying: (id, isPlaying) =>
    set((state) => ({
      voiceSamples: state.voiceSamples.map((sample) =>
        sample.id === id
          ? { ...sample, isPlaying }
          : { ...sample, isPlaying: false }
      ),
    })),
}));
