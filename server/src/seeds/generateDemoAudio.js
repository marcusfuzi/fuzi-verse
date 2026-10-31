import fs from 'fs';
import path from 'path';

// Helper to write a 16-bit mono or stereo WAV buffer
export function createWavBuffer({ sampleRate = 22050, durationSec = 12, generator }) {
  const numChannels = 1;
  const bytesPerSample = 2; // 16-bit
  const totalSamples = Math.floor(sampleRate * durationSec);
  const dataSize = totalSamples * numChannels * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // SubChunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28); // ByteRate
  buffer.writeUInt16LE(numChannels * bytesPerSample, 32); // BlockAlign
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let sample = generator(t, i, sampleRate);
    // Soft clip clamp
    sample = Math.max(-1, Math.min(1, sample));
    const intSample = Math.round(sample * 32767);
    buffer.writeInt16LE(intSample, offset);
    offset += 2;
  }

  return buffer;
}

// Ensure demo audio directory exists
export function ensureDemoAudioFiles(audioDir) {
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  const tracks = [
    {
      filename: 'midnight-cyberpunk.wav',
      duration: 14,
      generator: (t) => {
        // Synthwave arpeggio: Am - F - C - G
        const chordRoots = [220, 174.61, 261.63, 196]; // A3, F3, C4, G3
        const chordIdx = Math.floor(t * 0.5) % chordRoots.length;
        const root = chordRoots[chordIdx];

        // 16th note arp
        const arpStep = Math.floor(t * 8) % 4;
        const mults = [1, 1.2, 1.5, 2]; // minor triad + octave
        const freq = root * mults[arpStep];

        // Sawtooth-like wave with decay envelope per note
        const notePhase = (t * 8) % 1;
        const env = Math.exp(-notePhase * 4);
        const saw = (2 * ((t * freq) % 1) - 1) * 0.45;
        const sub = Math.sin(2 * Math.PI * (root / 2) * t) * 0.35;

        // Kick drum every beat (2 Hz)
        const beatT = (t * 2) % 1;
        const kickFreq = 120 * Math.exp(-beatT * 25) + 40;
        const kick = Math.sin(2 * Math.PI * kickFreq * beatT) * Math.exp(-beatT * 10) * 0.5;

        // Snare on offbeats
        const snareT = ((t + 0.25) * 2) % 1;
        const noise = (Math.random() * 2 - 1) * Math.exp(-snareT * 18) * 0.25;

        return (saw * env + sub + kick + noise) * 0.7;
      },
    },
    {
      filename: 'neon-tokyo-lofi.wav',
      duration: 16,
      generator: (t) => {
        // Lo-fi jazz chords: Dm9 -> G13 -> Cmaj9 -> Am7
        const beat = Math.floor(t * 1.5);
        const progressions = [
          [146.83, 220, 261.63, 329.63], // Dm9
          [196, 246.94, 329.63, 392],    // G13
          [130.81, 196, 246.94, 293.66], // Cmaj9
          [110, 164.81, 220, 261.63],    // Am7
        ];
        const chord = progressions[Math.floor(beat / 2) % progressions.length];

        // Electric piano / Rhodes bell tone
        let chime = 0;
        const barT = (t * 1.5) % 2;
        const chordEnv = Math.exp(-barT * 1.2);
        chord.forEach((freq, idx) => {
          chime += Math.sin(2 * Math.PI * freq * t) * (1 / (idx + 1));
        });

        // Lo-Fi vinyl crackle
        const crackle = (Math.random() > 0.985 ? (Math.random() * 2 - 1) * 0.15 : 0);

        // Relaxed kick and subtle shaker
        const kickT = (t * 1.5) % 1;
        const kick = Math.sin(2 * Math.PI * 65 * kickT) * Math.exp(-kickT * 8) * 0.4;
        const shaker = (Math.random() * 2 - 1) * Math.exp(-((t * 6) % 1) * 20) * 0.08;

        return (chime * chordEnv * 0.35 + kick + crackle + shaker) * 0.75;
      },
    },
    {
      filename: 'trap-genesis-808.wav',
      duration: 15,
      generator: (t) => {
        // Deep 808 Trap sub + rapid hi hats
        const beatT = (t * 2.2) % 1;
        // 808 sub bass drop
        const subPitch = 55 * Math.exp(-beatT * 4) + 40;
        const sub808 = Math.sin(2 * Math.PI * subPitch * t) * Math.exp(-beatT * 1.8) * 0.6;

        // Trap Hi-hat rolls (triplets occasionally)
        const hatSpeed = Math.floor(t * 2.2) % 4 === 3 ? 17.6 : 8.8;
        const hatT = (t * hatSpeed) % 1;
        const hihat = (Math.random() * 2 - 1) * Math.exp(-hatT * 25) * 0.18;

        // Snare / Clap on beat 2 & 4
        const clapT = ((t + 0.227) * 2.2) % 1;
        const clap = (Math.random() * 2 - 1) * Math.exp(-clapT * 16) * 0.35;

        // Dark bells melody
        const bellNotes = [440, 523.25, 659.25, 783.99, 659.25];
        const bellIdx = Math.floor(t * 4.4) % bellNotes.length;
        const bellEnv = Math.exp(-((t * 4.4) % 1) * 6);
        const bell = Math.sin(2 * Math.PI * bellNotes[bellIdx] * t) * bellEnv * 0.25;

        return (sub808 + hihat + clap + bell) * 0.8;
      },
    },
    {
      filename: 'velvet-horizon-ambient.wav',
      duration: 18,
      generator: (t) => {
        // Ethereal ambient pad with slowly oscillating LFO
        const lfo = Math.sin(2 * Math.PI * 0.2 * t) * 0.5 + 0.5;
        const f1 = 174.61 + Math.sin(t * 0.5) * 2; // F3
        const f2 = 220 + Math.cos(t * 0.3) * 2;    // A3
        const f3 = 261.63;                         // C4
        const f4 = 329.63;                         // E4

        const pad =
          Math.sin(2 * Math.PI * f1 * t) * 0.25 +
          Math.sin(2 * Math.PI * f2 * t) * 0.25 +
          Math.sin(2 * Math.PI * f3 * t) * 0.2 +
          Math.sin(2 * Math.PI * f4 * t) * 0.15;

        const deepDrone = Math.sin(2 * Math.PI * 55 * t) * 0.3;

        return (pad * (0.6 + 0.4 * lfo) + deepDrone) * 0.65;
      },
    },
    {
      filename: 'solaris-funk-groove.wav',
      duration: 14,
      generator: (t) => {
        // Funky slap bass + disco hi-hat
        const bassNotes = [82.41, 110, 123.47, 146.83, 164.81]; // E2, A2, B2, D3, E3
        const bassIdx = Math.floor(t * 4) % bassNotes.length;
        const bassEnv = Math.exp(-((t * 4) % 1) * 8);
        const bassFreq = bassNotes[bassIdx];
        const bass = Math.sin(2 * Math.PI * bassFreq * t) * bassEnv * 0.5;

        // Disco 4-on-the-floor kick
        const kickT = (t * 2) % 1;
        const kick = Math.sin(2 * Math.PI * 80 * Math.exp(-kickT * 10) * t) * Math.exp(-kickT * 7) * 0.45;

        // Open/closed hi-hat groove
        const hatT = (t * 4) % 1;
        const hat = (Math.random() * 2 - 1) * Math.exp(-hatT * 12) * 0.2;

        return (bass + kick + hat) * 0.75;
      },
    },
    {
      filename: 'indie-raindrift.wav',
      duration: 15,
      generator: (t) => {
        // Plucked acoustic harmonic guitar notes
        const guitarScale = [196, 220, 246.94, 293.66, 329.63, 392];
        const noteIdx = Math.floor(t * 3) % guitarScale.length;
        const noteT = (t * 3) % 1;
        const pluck = (Math.sin(2 * Math.PI * guitarScale[noteIdx] * t) +
          0.5 * Math.sin(4 * Math.PI * guitarScale[noteIdx] * t)) *
          Math.exp(-noteT * 5) * 0.45;

        // Gentle sub warm tone
        const warmPad = Math.sin(2 * Math.PI * 98 * t) * 0.2;

        return (pluck + warmPad) * 0.7;
      },
    },
  ];

  const generatedFiles = [];

  for (const track of tracks) {
    const filePath = path.join(audioDir, track.filename);
    if (!fs.existsSync(filePath)) {
      const buffer = createWavBuffer({
        sampleRate: 22050,
        durationSec: track.duration,
        generator: track.generator,
      });
      fs.writeFileSync(filePath, buffer);
      console.log(`Generated demo audio: ${track.filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
    }
    generatedFiles.push({
      ...track,
      url: `/uploads/audio/${track.filename}`,
    });
  }

  return generatedFiles;
}
