import path from 'node:path';
import fs from 'node:fs';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { ScriptGenerator } from '../services/script-generator';
import { TTSEngine } from '../services/tts-engine';
import type { RenderableScene, VideoCompositionProps } from '../types/schema';

async function main() {
  console.log('🚀 Iniciando pipeline Remotion AI Video...');

  const rootDir = process.cwd();
  const publicDir = path.join(rootDir, 'public');
  const outDir = path.join(rootDir, 'out');

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 1. Generar Guión (escribe-humano)
  console.log('📝 Paso 1: Generando guion técnico con escribe-humano...');
  const scriptGen = new ScriptGenerator();
  const script = await scriptGen.generate('Remotion y React');

  // 2. Síntesis de Audio y Extracción de Timestamps (Edge-TTS)
  console.log('🎙️ Paso 2: Sintetizando audios de escena y midiendo fotogramas...');
  const tts = new TTSEngine(publicDir);
  const renderableScenes: RenderableScene[] = [];

  for (const scene of script.scenes) {
    console.log(`  -> Procesando escena [${scene.id}]: "${scene.narrativeText.slice(0, 35)}..."`);
    const ttsResult = await tts.synthesize(scene.id, scene.narrativeText);

    // Calcular duración en fotogramas: (milisegundos / 1000) * fps
    const durationInFrames = Math.max(
      30,
      Math.ceil((ttsResult.durationMs / 1000) * script.fps)
    );

    renderableScenes.push({
      ...scene,
      audioFileName: ttsResult.audioFileName,
      audioDurationMs: ttsResult.durationMs,
      durationInFrames,
      wordTimestamps: ttsResult.wordTimestamps,
    });
  }

  const inputProps: VideoCompositionProps = {
    title: script.title,
    fps: script.fps,
    scenes: renderableScenes,
  };

  const totalFrames = renderableScenes.reduce((acc, s) => acc + s.durationInFrames, 0);
  console.log(`🎬 Duración total calculada: ${totalFrames} frames (~${(totalFrames / script.fps).toFixed(1)} segundos)`);

  // 3. Empaquetar composición de Remotion
  console.log('📦 Paso 3: Empaquetando composición con @remotion/bundler...');
  const entryPoint = path.join(rootDir, 'src', 'remotion', 'index.ts');
  const bundleLocation = await bundle({
    entryPoint,
    publicDir,
    onProgress: (progress) => {
      if (progress === 100 || progress % 25 === 0) {
        console.log(`  -> Bundling: ${progress}%`);
      }
    },
  });

  // 4. Seleccionar la Composición
  console.log('🔍 Paso 4: Seleccionando composición AIVideoComposition...');
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'AIVideoComposition',
    inputProps,
  });

  // 5. Renderizar Video a MP4
  const outputFile = path.join(outDir, 'video-output.mp4');
  console.log(`🎥 Paso 5: Renderizando video MP4 con @remotion/renderer en ${outputFile}...`);

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: outputFile,
    inputProps,
    onProgress: ({ progress }) => {
      const percentage = Math.round(progress * 100);
      if (percentage % 20 === 0) {
        console.log(`  -> Renderizado: ${percentage}%`);
      }
    },
  });

  console.log(`\n🎉 ¡VIDEO RENDERIZADO CON ÉXITO! -> ${outputFile}`);
}

main().catch((err) => {
  console.error('❌ Error en el pipeline:', err);
  process.exit(1);
});
