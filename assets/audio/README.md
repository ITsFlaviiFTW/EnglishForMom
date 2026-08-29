# Lesson audio

The WAV files in `en-US/` are generated with the development-only Piper toolchain by running:

```powershell
npm run generate-audio
```

The generator uses the `en_US-ljspeech-medium` Piper voice at a slightly slower speaking speed for
beginner listening. Its model card says it was trained from scratch from the public-domain LJSpeech
dataset. Piper itself is used only as a local development tool and is not bundled into the app.

To replace existing recordings after changing text, run:

```powershell
npm run generate-audio -- --force
```
