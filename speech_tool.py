import os
import openai
import speech_recognition as sr
import playsound
import tempfile

# SETTINGS
openai.api_key = os.getenv("OPENAI_API_KEY") or "BURAYA_API_KEYİNİ_KOYABİLİRSİN"

# Functions

def transcribe_from_mic():
    recognizer = sr.Recognizer()
    mic = sr.Microphone()

    print("Listening... (Speak now)")

    with mic as source:
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.listen(source)

    print("Processing speech...")
    try:
        # Use Whisper-1 API via OpenAI
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_audio:
            tmp_audio.write(audio.get_wav_data())
            tmp_audio.flush()

            transcript = openai.audio.transcriptions.create(
                file=open(tmp_audio.name, "rb"),
                model="whisper-1"
            )
            os.unlink(tmp_audio.name)

        print("You said:", transcript["text"])
        return transcript["text"]

    except Exception as e:
        print(f"Error during transcription: {e}")
        return ""

def chat_with_gpt(user_input):
    print("Sending to GPT...")
    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a helpful voice assistant."},
            {"role": "user", "content": user_input}
        ]
    )
    reply = response["choices"][0]["message"]["content"]
    print("GPT says:", reply)
    return reply

def speak_text(text):
    print("Synthesizing speech...")
    response = openai.audio.speech.create(
        input=text,
        model="tts-1",
        voice="alloy"
    )
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp_output:
        tmp_output.write(response.content)
        tmp_output.flush()
        tmp_path = tmp_output.name

    print("Playing audio...")
    playsound.playsound(tmp_path)
    os.unlink(tmp_path)

# Main loop

def main():
    print("Real-time Voice Agent started!")
    while True:
        try:
            user_text = transcribe_from_mic()
            if not user_text:
                continue

            if user_text.lower() in ["exit", "quit", "stop"]:
                print("Exiting Voice Agent.")
                break

            gpt_reply = chat_with_gpt(user_text)
            speak_text(gpt_reply)

        except KeyboardInterrupt:
            print("Stopped by user.")
            break
        except Exception as e:
            print(f"Error in main loop: {e}")

if __name__ == "__main__":
    main()
