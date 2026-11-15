"""Joins recordings and pauses into MP3 files for Prava's audio generators.

    python scripts/join_audio.py <job.json> <result.json>

Each item lists its parts in order: {"wav": path} (a 16-bit mono WAV; the
silence around the sound is trimmed) or {"silence": seconds}. The result gives,
for each output, the second at which each recording starts (used to highlight
words in "Cuvânt cu cuvânt").
"""

import array
import json
import sys
import wave
from pathlib import Path

import lameenc

SILENCE_THRESHOLD = 500  # 16-bit amplitude below which a sample counts as silence
EDGE_PADDING_SECONDS = 0.03


def read_wav(path: str) -> tuple[array.array, int]:
    with wave.open(path, "rb") as reader:
        if reader.getnchannels() != 1 or reader.getsampwidth() != 2:
            raise SystemExit(f"Expected 16-bit mono audio: {path}")
        rate = reader.getframerate()
        samples = array.array("h", reader.readframes(reader.getnframes()))
    return samples, rate


def trim(samples: array.array, rate: int) -> array.array:
    first = next((i for i, value in enumerate(samples) if abs(value) > SILENCE_THRESHOLD), None)
    if first is None:
        return samples
    last = next(i for i in range(len(samples) - 1, -1, -1) if abs(samples[i]) > SILENCE_THRESHOLD)
    padding = int(rate * EDGE_PADDING_SECONDS)
    return samples[max(first - padding, 0) : min(last + padding + 1, len(samples))]


def encode_mp3(samples: array.array, rate: int, bitrate: int) -> bytes:
    encoder = lameenc.Encoder()
    encoder.set_bit_rate(bitrate)
    encoder.set_in_sample_rate(rate)
    encoder.set_channels(1)
    encoder.set_quality(2)
    return bytes(encoder.encode(samples.tobytes()) + encoder.flush())


def main() -> None:
    job = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    cache: dict[str, tuple[array.array, int]] = {}
    results: dict[str, dict] = {}

    for item in job["items"]:
        recordings = []
        for part in item["parts"]:
            if "wav" in part:
                if part["wav"] not in cache:
                    samples, rate = read_wav(part["wav"])
                    cache[part["wav"]] = (trim(samples, rate), rate)
                recordings.append(cache[part["wav"]])
        rates = {rate for _, rate in recordings}
        if len(rates) != 1:
            raise SystemExit(f"Recordings must share one sample rate: {item['output']}")
        rate = rates.pop()

        combined = array.array("h")
        starts: list[float] = []
        recording = iter(recordings)
        for part in item["parts"]:
            if "wav" in part:
                starts.append(round(len(combined) / rate, 3))
                combined.extend(next(recording)[0])
            else:
                combined.extend(array.array("h", [0]) * int(rate * part["silence"]))

        output = Path(item["output"])
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_bytes(encode_mp3(combined, rate, job["bitrate"]))
        results[item["output"]] = {"starts": starts, "duration": round(len(combined) / rate, 3)}
        print(f"  {output.name}")

    Path(sys.argv[2]).write_text(json.dumps(results, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
