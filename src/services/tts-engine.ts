import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import type { WordTimestamp } from '../types/schema';

export interface TTSResult {
  audioFileName: string;
  durationMs: number;
  wordTimestamps: WordTimestamp[];
}

export class TTSEngine {
  private publicDir: string;
  private voice: string;

  constructor(publicDir: string, voice = 'es-AR-TomasNeural') {
    this.publicDir = publicDir;
    this.voice = voice;
    if (!fs.existsSync(this.publicDir)) {
      fs.mkdirSync(this.publicDir, { recursive: true });
    }
  }

  async synthesize(sceneId: string, text: string): Promise<TTSResult> {
    const audioFileName = `audio-${sceneId}.mp3`;
    const audioFilePath = path.join(this.publicDir, audioFileName).replace(/\\/g, '/');

    const pythonScript = `
import asyncio, json, sys, edge_tts

async def run():
    text = sys.argv[1]
    voice = sys.argv[2]
    out_audio = sys.argv[3]
    
    comm = edge_tts.Communicate(text, voice, boundary='WordBoundary')
    words = []
    audio_data = bytearray()
    
    async for chunk in comm.stream():
        if chunk['type'] == 'audio':
            audio_data.extend(chunk['data'])
        elif chunk['type'] == 'WordBoundary':
            start_ms = chunk['offset'] / 10000.0
            dur_ms = chunk['duration'] / 10000.0
            words.append({
                'word': chunk['text'],
                'startMs': round(start_ms, 2),
                'endMs': round(start_ms + dur_ms, 2)
            })
            
    with open(out_audio, 'wb') as f:
        f.write(audio_data)
        
    duration_ms = 0
    if len(words) > 0:
        duration_ms = words[-1]['endMs'] + 400.0
    else:
        duration_ms = 1500.0
        
    print(json.dumps({'durationMs': duration_ms, 'words': words}))

asyncio.run(run())
`;

    return new Promise<TTSResult>((resolve, reject) => {
      const proc = spawn('python', ['-c', pythonScript, text, this.voice, audioFilePath]);
      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (d) => {
        stdout += d.toString();
      });

      proc.stderr.on('data', (d) => {
        stderr += d.toString();
      });

      proc.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`TTS generation failed with code ${code}: ${stderr}`));
          return;
        }

        try {
          const lines = stdout.trim().split('\n');
          const lastLine = lines[lines.length - 1];
          const parsed = JSON.parse(lastLine);
          resolve({
            audioFileName,
            durationMs: parsed.durationMs,
            wordTimestamps: parsed.words,
          });
        } catch (err) {
          reject(new Error(`Failed to parse TTS engine response: ${stdout} - ${err}`));
        }
      });
    });
  }
}
