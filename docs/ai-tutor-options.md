# AI tutor options for Prava (researched 2026-11-14)

Goal: a patient tutor that explains English in Romanian (optionally Ukrainian),
speaks the English model phrase clearly, shows a transcript, and stays cheap.
Prices are from provider pages or third-party summaries found on 2026-11-14;
re-check the official pricing pages before committing.

## Existing apps (could Mom just use one?)

| App | Notes | Romanian explanations? |
|---|---|---|
| Praktika | AI avatar tutor, pronunciation/grammar feedback, remembers mistakes; iPhone/Android | Not confirmed (said to support ~14 languages) |
| Speak | Strong speaking practice, explains why a phrase is awkward | Not confirmed (6–7 languages) |
| Duolingo Max | AI roleplay/video call | Roleplay limited to major languages |

None was confirmed to explain English in Romanian, so building Prava's own tutor
is still the most promising route.

## Building blocks

| Piece | Option | Price (approx.) | Notes |
|---|---|---|---|
| Tutor "brain" (text) | Claude Haiku 5.5 (`claude-haiku-5-5`) | $0.10 / $0.50 per 1M tokens in/out | ~$0.0003 per tutor turn (2k in, 150 out) |
| | Claude Sonnet 5.5 (`claude-sonnet-5-5`) | $2 / $10 per 1M tokens | ~$0.006 per turn; try if Haiku's Romanian is not natural enough |
| Speech → text | OpenAI `gpt-realtime-whisper` | ~$0.017/min (third-party listing) | Mom's Romanian/English speech |
| Text → speech | OpenAI `gpt-4o-mini-tts` | ~$0.015/min | `instructions` steer tone/pace ("slow, warm") |
| | Azure neural voices `ro-RO-AlinaNeural`, `ro-RO-EmilNeural` | per-character pricing | Natural Romanian narration |
| Pronunciation feedback | Azure Pronunciation Assessment | billed like speech-to-text | Word/phoneme scores for English |
| Realtime voice (all-in-one) | Google Gemini 3.8 Live | $0.005/min in, $0.018/min out (Google, Sept 2026) | Romanian is in the official language list |
| | OpenAI `gpt-realtime-2.x` | ~$0.05–0.15/min (estimates) | Prompt can request "a light X accent"; accent drift is possible |
| | ElevenLabs Agents | ~$0.08/min + LLM | Large voice library; Romanian/Ukrainian not verified |

Claude has no built-in speech input/output, so with Claude as the brain the audio
comes from separate speech-to-text and text-to-speech services.

## Cheap Romanian (and English) voices (researched 2026-11-14)

How much text Prava needs: Romanian explanations for every lesson item are a
few hundred thousand characters in total, and a daily 15-minute tutor speaks
roughly 100–150k characters a month. Both fit inside the free tiers below.

| Service | Romanian voices | Price per 1M characters | Free every month |
|---|---|---|---|
| **Azure Speech** | `ro-RO-AlinaNeural`, `ro-RO-EmilNeural` (neural) | ~$15 neural, $22 Neural HD | **500k neural characters, no expiry** |
| **Google Cloud TTS** | ro-RO in Chirp 3 HD (confirmed), WaveNet/Standard (names unconfirmed) | $4 WaveNet/Standard, $16 Neural2, $30 Chirp 3 HD | 1M Chirp 3 HD; 1–4M WaveNet (sources disagree) |
| Amazon Polly | `Carmen`, Standard engine only (older, robotic) | $4 Standard | 5M Standard for 12 months |
| ElevenLabs Flash v2.5 | Romanian likely (32 languages), unconfirmed | ~$50 | 10k credits on the free plan |
| Gemini 3.8 Flash TTS | 100+ languages, Romanian unconfirmed | billed per token | sources disagree |
| **Piper `ro_RO-mihai-medium`** | one male voice, runs on this PC | **$0** | unlimited; check the model card's license |

Recommendation: **Azure Speech free tier**. Real neural Romanian voices, and
the free 500k characters a month cover both pre-made lesson explanations and
the tutor's spoken replies. The same free tier could also re-record all English
lesson audio (about 10k characters) with a more natural voice than Piper's.
Azure's multilingual voices can switch to English for a word inside a Romanian
sentence (SSML `<lang>`), so "Drawer înseamnă sertar" can pronounce "drawer"
in English. Needs an Azure account and a Speech resource on the F0 (free) tier.

Free fallback while no account exists: Piper's Romanian voice on this PC.

Sources: [Azure TTS pricing summary](https://texttolab.com/blog/azure-text-to-speech-pricing),
[Azure Neural HD price change](https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/azure-speech-%E2%80%93-neural-hd-text-to-speech-recent-voice-updates/4505380),
[Google Cloud TTS pricing summary](https://texttolab.com/blog/google-cloud-tts-pricing),
[Google Chirp 3 HD languages](https://docs.cloud.google.com/text-to-speech/docs/chirp3-hd),
[Google TTS release notes](https://docs.cloud.google.com/text-to-speech/docs/release-notes),
[Amazon Polly standard voices](https://docs.aws.amazon.com/polly/latest/dg/standard-voices.html),
[Amazon Polly pricing summary](https://costbench.com/software/ai-voice-tools/amazon-polly/),
[ElevenLabs API pricing](https://elevenlabs.io/pl/pricing/api),
[Gemini 3.8 Flash TTS release](https://datanorth.ai/news/google-releases-gemini-3-8-flash-tts),
[Piper Romanian voices](https://huggingface.co/rhasspy/piper-voices/tree/main/ro/ro_RO).

## Familiar accent

OpenAI's realtime prompting guide shows "Speak English with a light Australian
accent" and warns that prompting "cannot fully replace voice design"; accents
can drift. No provider documents a Romanian- or Ukrainian-accented English
voice, so this must be tested by ear. Keep it optional and never use it for the
model pronunciation of lesson phrases (those stay the recorded clear English).

Built for the lessons (November 2026): the "Cu accent românesc" button. Every
English phrase is written with Romanian letters ("Dă milc iz in dă frigi.") and
read by Azure's `ro-RO-AlinaNeural`, then the normal English plays. All lesson
English is now Azure's `en-US-AvaNeural`, replacing the local Piper voice.
This gives a stable Romanian accent (no drift) because the voice really is
Romanian. A tutor could reuse the same idea: ask the model for the Romanian
spelling of its English phrase and send that to the Romanian voice.

## Recommendation

Phase 2 prototype: **push-to-talk pipeline** (not always-on live audio).

1. Mom holds the mic button and speaks (Romanian or English).
2. Speech-to-text turns it into text, shown as a transcript.
3. Claude (start with Haiku 5.5, compare with Sonnet 5.5) answers with a fixed
   shape: a short Romanian explanation, the English phrase, one easy follow-up
   question, using the current lesson's words and her recent mistakes.
4. The Romanian explanation is spoken with a Romanian voice; the English phrase
   plays from the lesson's recordings when available, otherwise English TTS.

Why: transcripts and lesson context come for free, each piece can be swapped,
and the cost stays around **$5–10 a month** at 15 minutes a day. A small server
endpoint holds the API keys and enforces a daily minute limit.

Phase 3: try Gemini Live (cheapest realtime option with Romanian) for free
conversation once the push-to-talk version proves useful.

## Sources

- OpenAI voice prompting guide: https://developers.openai.com/api/docs/guides/voice-prompting
- OpenAI gpt-4o-mini-tts model page: https://developers.openai.com/api/docs/models/gpt-4o-mini-tts.md
- OpenAI Realtime pricing summaries: https://www.forasoft.com/blog/article/openai-realtime-api-pricing , https://www.glamdringresearch.com/post/openai-realtime-api-pricing
- Gemini API pricing: https://ai.google.dev/gemini-api/docs/pricing
- Gemini Live languages: https://ai.google.dev/gemini-api/docs/live-api/capabilities
- Gemini 3.8 Live announcement: https://blog.google/innovation-and-ai/technology/developers-tools/build-real-time-voice-applications-gemini-audio/
- ElevenLabs Agents pricing summary: https://www.getmacha.com/blog/elevenlabs-agents-pricing-explained
- Azure pronunciation assessment billing: https://learn.microsoft.com/en-us/answers/questions/5608069/pricing-and-usage-of-pronunciation-assessment-feat
- Azure Romanian voices: https://json2video.com/ai-voices/azure/voices/ro-ro-alinaneural/
- AI tutor app comparisons: https://languatalk.com/blog/learn-english-with-ai-english-tutor , https://getfluently.app/blog/best-ai-apps-to-learn-english
