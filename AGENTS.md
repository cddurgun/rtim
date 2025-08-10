<general_rules>
There are no explicit general rules or coding standards defined in this repository. Developers should aim for clear, readable, and maintainable Python code. There are no linter or formatter scripts configured.
</general_rules>
<repository_structure>
This repository contains a minimal Python implementation for speech-to-text (STT) and text-to-speech (TTS) using the OpenAI API. The core logic resides in `speech_tool.py`, which demonstrates how to transcribe audio from a microphone, chat with GPT, and synthesize speech from text. The `README.md` provides an overview, installation instructions, and usage examples.
</repository_structure>
<dependencies_and_installation>
This project requires Python 3.8+ and an OpenAI API key. Dependencies are managed via `pip` and listed in `requirements.txt`. To install, create a virtual environment and install the requirements:

```bash
python3 -m venv venv
. venv/bin/activate
pip install -r requirements.txt
```
</dependencies_and_installation>
<testing_instructions>
There are no formal testing instructions or testing frameworks configured in this repository (e.g., pytest, unittest). Testing is currently performed manually by running the `speech_tool.py` script and verifying its functionality.
</testing_instructions>
<pull_request_formatting>
