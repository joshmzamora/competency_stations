# Competency Stations

Competency Stations is a web-based nursing competency simulation and practice tool for guided scenarios, checkoffs, timed questions, interactive activities, and self-study.

## Open the Website

**https://competency-stations.onrender.com/**

For normal use, that is all you need. There is no local server setup, Node.js installation, Windows launcher, or same-Wi-Fi requirement.

## One Player Practice

Use **One Player Practice** for independent review on a single device.

1. Open the website.
2. Choose **One Player Practice**.
3. Select a competency station.
4. Answer the question or complete the activity.
5. Timed prompts begin automatically.
6. Reveal the expected answer when ready.
7. Grade yourself as **Correct**, **Partial**, or **Missed**.
8. Continue through the station and review your results at the end.

Solo mode is designed to keep the question large and easy to read, with minimal extra instructions on screen.

## Host + Player Mode

Use **Host Mode** and **Player Mode** for instructor-led or partner practice.

### Host

1. Open the website and choose **Start Host Mode**.
2. Create a room.
3. Choose a competency station.
4. Start the session and advance through the prompts.
5. Review expected responses and evaluation criteria.
6. Grade responses as Correct, Partial, or Incorrect.

### Player

1. Open the same website and choose **Start Player Mode**.
2. Enter the room code from the host.
3. Join the session.
4. Follow the learner-facing prompts and activities as the host advances the station.

The host and player can use separate browsers or devices. The hosted app handles synchronization through the server.

## Features

- One-player self-practice
- Host-led competency sessions
- Separate learner/player screen
- Automatic timers for timed prompts
- Interactive sorting and selection activities
- Expected-response reveal
- Correct / Partial / Missed self-grading in solo mode
- Host evaluation and scoring
- Critical actions and escalation guidance
- End-of-station review and results

## Current Stations

- Code Blue
- Hemodynamics
- Chest Tube
- Code BERT
- Stroke
- CAUTI / CLABSI Prevention
- Pressure Injury

Station content is defined in `src/data/stations.ts`.

## Development

The hosted website is the recommended way to use Competency Stations. The steps below are only for development or contributing to the project.

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Then open the local URL shown in the terminal.

### Build

```bash
npm run build
```

### Start the production build

```bash
npm run start
```

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Native WebSockets / Node.js server

## Content Note

Competency Stations is intended for nursing education, simulation, and competency practice. Clinical content should be reviewed against current institutional policies, procedures, and instructor guidance before use in formal evaluation.
