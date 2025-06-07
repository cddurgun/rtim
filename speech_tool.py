import argparse
import os

import openai


def transcribe_audio(audio_path: str, model: str = "whisper-1") -> str:
    """Transcribe audio using OpenAI Whisper."""

    with open(audio_path, "rb") as audio_file:
        transcript = openai.audio.transcriptions.create(
            file=audio_file,
            model=model,
        )

    return transcript["text"]


def synthesize_speech(text: str, output_path: str, voice: str = "alloy") -> None:
    """Synthesize speech using OpenAI TTS."""
    response = openai.audio.speech.create(
        input=text,
        model="tts-1",
        voice=voice,
    )

    with open(output_path, "wb") as out:
        out.write(response.content)



def main():
    parser = argparse.ArgumentParser(description="STT and TTS tool")
    parser.add_argument("--audio", help="Path to input audio file for STT", required=False)
    parser.add_argument("--text", help="Text for TTS", required=False)
    parser.add_argument("--output", help="Output path for synthesized speech", default="output.mp3")
    parser.add_argument("--api-key", help="OpenAI API key (or set OPENAI_API_KEY)")
    args = parser.parse_args()

    openai.api_key = args.api_key or os.getenv("OPENAI_API_KEY")
    if not openai.api_key:
        parser.error("OpenAI API key not provided. Set OPENAI_API_KEY or use --api-key")

    if args.audio:
        print("Transcribing audio...")
        transcript = transcribe_audio(args.audio)
        print("Transcript:", transcript)

    if args.text:
        print("Synthesizing speech...")
        synthesize_speech(args.text, args.output)
        print(f"Saved synthesized speech to {args.output}")


if __name__ == "__main__":
    print("Speech Tool is starting...")
    main()

