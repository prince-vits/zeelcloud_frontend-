# 🏗️ ZeelCloud — Build & Test Notes

Everything you need to test and build this app, **plus the exact mistakes that
broke the build on another project (The Stoic)** — written here as warnings so
they can't repeat on ZeelCloud.

Last updated: **18 July 2026**

---

## 0. Quick facts about THIS project (ZeelCloud)

| Thing | Value |
|---|---|
| Framework | Expo SDK 54, React Native 0.81.5 |
| Workflow | **Bare** (the `android/` and `ios/` folders are committed) |
| EAS project slug | `ZeelCloudRN` |
| `babel-preset-expo` in package.json | ✅ **Yes** (`~54.0.10`) — already correct |
| Already built successfully? | ✅ Yes — there are working `.apk` files from 15–16 July |

**What this means:** ZeelCloud is in good shape and has already produced APKs, so
most of the traps below were already avoided here. Keep it that way.

---

## 1. Do I need ANOTHER Expo account? — **NO**

One Expo account holds **unlimited projects**. ZeelCloud and The Stoic can both
live under the **same** Expo account (e.g. `cursedstoic`), each as its own project
with its own slug (`ZeelCloudRN` vs `cursedstoic`).

- ✅ Use your existing Expo account for both.
- ⚠️ **BUT** — if the *client* owns this app, it's cleaner to build it under the
  **client's own Expo account** (or a ZeelCloud-specific one), so ownership,
  billing, and the signing keys belong to them, not you. Decide this with the
  client before the store upload. Signing keys especially should belong to
  whoever owns the Play/App Store listing.

---

## 2. Can I test with Expo Go, or do I need a build?

Same rule as any Expo app:

| Want to test… | Expo Go? | Needs a build? |
|---|---|---|
| Screens, navigation, forms, business logic | ✅ yes | — |
| **Database / API calls** (fetch to your .NET backend, REST, etc.) | ✅ **yes** | — |
| **Google login** | ⚠️ usually **no** | ✅ **yes** (see below) |
| Push notifications, camera, biometrics, in-app purchase, any native module | ❌ no | ✅ yes |

> ⚠️ **This project is BARE workflow (has `android/`+`ios/`).** Bare projects often
> can't run in Expo Go at all — you use a **dev build** instead. Since ZeelCloud
> already builds APKs, just build a **preview** APK to test on a real device.

### About Google login specifically
- If it uses the **native** Google Sign-In (`@react-native-google-signin`) →
  **must** be a real build; it will never work in Expo Go.
- If it uses a **web/browser** OAuth flow → may work in a dev build; test it there.
- Either way: **test Google login on a real installed build, not Expo Go.**

### About the database
Database access is just **network calls** to your backend. Those work in Expo Go
*and* in a build. So you can check the database early in Expo Go — but do a final
check in the real build too, because the real build runs over the internet exactly
as users will.

---

## 3. ⚠️ THE MISTAKES I (Claude) MADE ON THE STOIC — don't repeat them

These cost hours of failed cloud builds on the other project. Written as warnings.
ZeelCloud already dodges most, but check each before you build.

### ❌ Mistake 1 — `babel-preset-expo` missing from package.json  *(the "JS log" error)*

**What happened:** The cloud build failed instantly at "Bundle JavaScript" with:
```
SyntaxError: Cannot find module 'babel-preset-expo'
```
It worked on my Mac (the package was hidden inside `expo/node_modules`) but the
cloud's fresh install couldn't find it, because `babel.config.js` uses it but it
was **not listed in package.json**.

**How I resolved it:**
```bash
npm pkg set devDependencies.babel-preset-expo="~54.0.11"
npm pkg set devDependencies.@babel/core="^7.25.2"
npm install    # update package-lock.json
```

**ZeelCloud status:** ✅ already has `babel-preset-expo`. Safe. (If you ever see
this error, this is the fix.)

**The lesson:** anything used in `babel.config.js` / `metro.config.js` must be an
**explicit** dependency in package.json — never rely on it being installed
indirectly. Run `npx expo-doctor` — it catches this.

---

### ❌ Mistake 2 — `.easignore` excluded the app's OWN code

**What happened:** To stop huge server files uploading, I added a `.easignore`
with the line `backend/`. But in ignore-file syntax, `backend/` (no leading slash)
matches **every** folder named `backend` anywhere — including the app's own
`src/backend/`. The build then failed with:
```
Unable to resolve module ./src/backend/config
```
I had accidentally deleted my own source from the upload.

**How I resolved it:** anchor the pattern to the project root with a **leading
slash**:
```
/backend/      ✅ excludes only the top-level server folder
backend/       ❌ WRONG — also excludes src/backend/
```

**The lesson:** in `.gitignore` / `.easignore`, **always use a leading slash** to
target a top-level folder. Without it, the pattern matches that name at every
depth. **ZeelCloud has no `.easignore`** — if you ever add one, remember this.

---

### ❌ Mistake 3 — 5.7 MB JSON imported straight into the app

**What happened:** The app did `import data from "big-file.json"` where the file
was 5.7 MB. That gets compiled into the app's code and can crash the cloud build
worker on memory. (This turned out not to be the actual failure on The Stoic, but
it's a real risk and bad practice.)

**The lesson:** don't `import` huge JSON/data files into the app. Keep bundled data
small, or load big data at runtime from your server / a bundled asset file.
**Check ZeelCloud** for any large `import ... from "*.json"`.

---

### ❌ Mistake 4 — the failure took forever to diagnose because I didn't read the log

**What happened:** The cloud showed a vague `Unknown error. See logs of the Bundle
JavaScript build phase.` I guessed at causes and wasted several 15-minute builds.
The moment I got the **actual log text**, the real cause (Mistake 1) was obvious.

**The lesson — DO THIS FIRST when a build fails:**
1. Open the **logs link** the build prints
2. Find the step with a red **✖**
3. Click it → scroll to the bottom → **copy the last ~20 lines**
4. Read THAT — don't guess. The real error is almost always in plain text there.

`Unknown error` at "Bundle JavaScript" often = the build worker ran out of memory
(process killed → no message). But confirm with the log before assuming.

---

## 4. ✅ YOUR STEPS — test & build ZeelCloud (do these in order)

### Step A — Sanity check the project (2 min)
```bash
cd ~/Desktop/ZeelCloud-develop/ZeelCloudRN
npx expo-doctor
```
Fix anything it flags (this catches Mistake 1 automatically). Aim for
**"No issues detected."**

### Step B — Log in to Expo (once)
```bash
npx eas-cli@latest login
```
Use the account that should own this app (yours, or the **client's** — decide with
them first). Type username + password; never share the password.

### Step C — Build a testable APK
```bash
npx eas-cli@latest build --profile preview --platform android
```
- Watch the **"Compressed project files"** size — if it's huge (tens of MB),
  something heavy is being uploaded; consider a `/`-anchored `.easignore`.
- ~10–15 min → it prints a **link** → open on your phone → install the `.apk`.

### Step D — Test the real things on the installed app
- ✅ **Database** — open a screen that loads/saves data; confirm it reaches the backend
- ✅ **Google login** — sign in fully; confirm it returns to the app signed in
- ✅ Any other native feature (notifications, camera, etc.)

### Step E — When happy, build for the stores
```bash
npx eas-cli@latest build --profile production --platform android   # .aab for Play Store
npx eas-cli@latest build --profile production --platform ios       # for App Store
```
(`production` makes store files you can't install directly — that's expected.)

### Step F — Before store submission, also have ready
- A **Privacy Policy** hosted at a public URL (both stores require it)
- Store listing text + screenshots
- The **client's** Play Store / App Store accounts (they already have these)
- Decide **who owns the signing keys** — should be the client

---

## 5. One-line summary

ZeelCloud already builds and already has `babel-preset-expo` — you're in good shape.
**Test on a real preview build (not Expo Go) for the database + Google login**, read
the actual log if a build fails, and always anchor `.easignore` patterns with a
leading slash. Same Expo account is fine, but consider building under the **client's**
account so they own it.
