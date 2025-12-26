const axios = require('axios')
const express = require('express')
const router = express.Router()
const { ElevenLabsClient, play } = require('@elevenlabs/elevenlabs-js');
const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
});
console.log(" TTS route file loaded");
router.post('/', async (req, res) => {
  try {
    const { text, voiceid } = req.body;

    const audioStream = await elevenlabs.textToSpeech.convert(
      voiceid || "JBFqnCBsd6RMkjVDRZzb",
      {
        text,
        modelId: "eleven_multilingual_v2",
        outputFormat: "mp3_44100_128"
      }
    );

    // Convert Web ReadableStream → Buffer
    const reader = audioStream.getReader();
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const audioBuffer = Buffer.concat(
      chunks.map(chunk => Buffer.from(chunk))
    );

    res.set("Content-Type", "audio/mpeg");
    res.send(audioBuffer);

  } catch (err) {
    console.error("External TTS error:", err);
    res.status(500).json({ error: "External TTS failed" });
  }
})
// define the about route
router.get('/about', (req, res) => {
    res.send('About ai summary')
})

module.exports = router
