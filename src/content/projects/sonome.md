---
name: Sonome
repo: kovirlabs/sonome
tagline: Read a song's acoustic features and find tracks with a similar sound, locally and honestly.
audience: Developers and music hobbyists who want a local, transparent music-analysis tool.
support: lab
status: pre-release
order: 50
category: library
platforms: [python]
---

Sonome extracts music-information-retrieval features from an audio file. It translates them into
human-readable descriptors: tempo feel, key and mode, brightness, energy, and mood. It then scores
tracks by how similar they sound, so you can build a lineup of songs that share a seed song's
character.

It is a small Python library built on [librosa](https://librosa.org/). It needs no API keys or
online services, and it is local-first. When a value is an estimate rather than a measurement,
Sonome labels it as one. It does not pass guesses off as facts.

Sonome is pre-alpha. The current code is a single-file seed, and the packaged library and command
line are still on the roadmap.
