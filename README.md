# Speech Interface

This repository contains a minimal Python implementation for performing
speech-to-text (STT) and text-to-speech (TTS) using the OpenAI API. The example
code demonstrates how to call the Whisper and TTS endpoints from a local
environment.

## Requirements

- Python 3.8+
- An OpenAI API key provided via the `OPENAI_API_KEY` environment variable or
  passed with the `--api-key` flag

## Installation

```bash
python3 -m venv venv
. venv/bin/activate
pip install -r requirements.txt
```

## Usage

The provided `speech_tool.py` script demonstrates how to transcribe an audio file
and synthesize speech from text using OpenAI's APIs. Set your API key as an
environment variable or pass it on the command line.

```bash
export OPENAI_API_KEY=YOUR_KEY
python speech_tool.py --audio input.wav --text "Hello, world" --output spoken.mp3
```
If you prefer not to set an environment variable, you can pass the API key
directly:

```bash
python speech_tool.py --api-key YOUR_KEY --text "Hello" --output out.mp3
```

The script requires network access and a valid OpenAI API key.

