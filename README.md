## Little Storyteller (Sanitized for Open Source)

Little Storyteller is a React Native app that generates kid-friendly stories and dialogue cards, with optional text-to-speech and translation helpers. This repo has been sanitized to remove secrets and vendor files so it can be safely published.

Repository on GitHub: [`sabhierfan/Little-Story-Teller`](https://github.com/sabhierfan/Little-Story-Teller)

### Features

- Age-appropriate story generation UI
- Dialogue and story views
- Optional Text-to-Speech via ElevenLabs (bring your own API key)
- Optional Firebase integration for auth/storage (bring your own config)
- Responsive layout utilities

### Project Structure

```text
app/
  auth/                # login/signup screens
  components/          # reusable UI
  dialoguegen/         # dialogue generation views
  mydialogues/         # saved dialogues (optional with backend)
  mystories/           # saved stories (optional with backend)
  navigation/          # navigators and drawer
  profile/             # profile screen
  storygen/            # story generator components
  tabs/                # tab navigator
  translate/           # translation UI
  utils/               # firebase, tts, firestore, prompts, responsive utils
assets/                # images, fonts
```

Key files:
- `app/utils/firebase.js`, `app/utils/firebaseConfig.js`: Firebase app/auth setup (placeholders)
- `app/utils/elevenLabsTTS.js`: ElevenLabs TTS helper (env-driven)
- `app/google-services.json`: removed from repo; required locally for Android builds

### Requirements

- Node.js LTS and npm or yarn
- React Native environment (Expo or bare RN). This project references Expo-style public env vars; you can use Expo or replicate `.env` loading.

### Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create local env file from the example and fill in your values:
   ```bash
   copy env.example .env   # Windows
   # or: cp env.example .env
   ```
3. (Android only) Add your `google-services.json` under `app/`.
4. Run the app (example with Expo):
   ```bash
   npx expo start
   ```

### Environment Variables

The app reads public variables (compatible with Expo) and falls back to placeholders if not provided. See `env.example` for full list.

Required for Firebase (optional feature):
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

Optional for ElevenLabs TTS:
- `EXPO_PUBLIC_ELEVEN_LABS_API_KEY`
- `EXPO_PUBLIC_ELEVEN_LABS_VOICE_ID`

### Security & Sanitization Notes

- Secrets have been removed and replaced with placeholders.
- `app/google-services.json` has been deleted and is listed in `.gitignore`.
- Do not commit real API keys or service files to this repository.

### Building

- With Expo: use EAS or classic builds per Expo docs.
- Bare RN: integrate Firebase configs per platform; ensure env variables are injected at build time.

### Troubleshooting

- Missing Firebase config: provide your env values or disable dependent screens.
- TTS failing: ensure `EXPO_PUBLIC_ELEVEN_LABS_API_KEY` is set and network access is available.
- Android build errors about Google Services: ensure `app/google-services.json` is present locally and not committed.

### License

MIT. See `LICENSE`.


