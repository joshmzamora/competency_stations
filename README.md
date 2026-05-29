# Competency Stations

Competency Stations is a local-network medical competency simulation website.

It is built for two computers on the same Wi-Fi network:

- The host computer runs the Node.js server and opens `http://localhost:3000/host`.
- The learner/player computer opens the host computer's Wi-Fi address, like `http://192.168.1.45:3000/player`.

No Supabase, Firebase, Socket.IO, accounts, cloud database, or outside syncing service is required.

## Easiest Windows Start

On the host computer:

1. Make sure Node.js LTS is installed from `https://nodejs.org/`.
2. Copy this whole project folder onto the computer.
3. Double-click:

```txt
start-game.bat
```

4. Click `Start Game`.
5. The launcher opens Host Mode automatically:

```txt
http://localhost:3000/host
```

6. On the learner computer, open the Player URL shown in the launcher.

Example:

```txt
http://192.168.1.45:3000/player
```

Keep the launcher window open while the simulation is running.

### What The Launcher Does

The `start-game.bat` launcher is meant for easy use on any Windows computer.

It will:

- check that Node.js and npm are installed
- install project dependencies if `node_modules` is missing
- start the local Node.js server
- open the host screen in the browser
- show the learner/player URL for the second computer
- let you copy the player URL
- let you stop the server when finished

If you copy the project folder with `node_modules` already included, the launcher can start faster because it does not need to download dependencies again. If `node_modules` is not included, the host computer needs internet the first time so `npm install` can download the required packages.

## What This App Does

This app is not a trivia board. It is a guided competency checkoff system for simulation-style nursing stations.

The host controls the session:

- creates a room code
- chooses a competency station
- advances through scenario prompts
- sees expected responses and explanations
- sees rubric/evaluation criteria
- starts and resets timers
- marks Correct, Partial Credit, or Incorrect
- flags prompts for review
- ends the session and saves results

The learner/player screen is a clean simulation prompt monitor:

- shows the active station
- shows only the learner-facing prompt or activity
- does not show answers
- does not show explanations
- does not show rubric criteria
- supports local synced activities such as Stroke card sorting

## Current Stations

The homepage and host page include these station cards:

- Code Blue
- Hemodynamics
- Pacemaker
- Chest tube
- Code BERT
- Stroke
- CAUTI/CLABSI prevention
- Pressure Injury Station

These stations are based on the 2026 RN Competency scenario document. Chest tube has the most detailed competency content so far; the other stations have been started from the scenario's expected interventions and can be expanded as you refine the checkoff.

Station content lives in:

```txt
src/data/stations.ts
```

## Chest Tube Competency Content

The Chest Tube station includes guided prompts for:

- safe clamping rules
- subcutaneous emphysema assessment
- STAT CT transport with continuous suction
- adequate suction verification
- output escalation thresholds
- air leak identification and localization
- insertion-site assessment
- dislodgement emergency response

Each prompt can include:

- learner scenario
- step-by-step instructions
- expected response
- explanation
- evaluation criteria
- critical actions
- provider notification thresholds
- optional timer

## What Is Node.js?

Node.js lets your computer run JavaScript outside the browser.

For this project, Node.js does two jobs:

1. It serves the website pages.
2. It runs the WebSocket server that keeps the host and learner screens synced.

The learner computer does not need Node.js because it only opens the website in a browser.

## Why Only The Host Computer Needs Node.js

Think of the host computer as the small local server for the simulation.

The host computer says:

```txt
I am running the competency session. Other computers on this Wi-Fi can connect to me.
```

The learner computer only says:

```txt
I will open the host computer's address in my browser.
```

That is why Node.js is installed only on the host computer.

## Install Node.js

1. Go to `https://nodejs.org/`
2. Download the LTS version.
3. Install it using the default options.
4. Close and reopen your terminal.
5. Check that Node.js works:

```powershell
node -v
npm -v
```

If both commands print version numbers, Node.js is installed.

## Install This Project

Open a terminal in the project folder:

```powershell
cd C:\Users\PC\Documents\Github\competency_stations
```

Install the project dependencies:

```powershell
npm install
```

Dependencies are the code libraries this app needs, such as React, Vite, Tailwind CSS, and Framer Motion.

## Start The Website

The easiest way on Windows is to double-click:

```txt
start-game.bat
```

Then click `Start Game`.

Manual terminal method:

```powershell
npm run dev
```

You should see something like:

```txt
Competency Stations is running on http://localhost:3000
Player/other device URL: http://192.168.1.45:3000
```

Keep this terminal open while using the simulation.

## Host Computer Instructions

On the host computer, open:

```txt
http://localhost:3000/host
```

Then:

1. Click `Create room`.
2. Tell the learner the room code.
3. Choose the first competency station.
4. Click `Start`.
5. Advance through prompts.
6. When a station is complete, choose the next station from the host station list.
7. Evaluate using Correct, Partial Credit, or Incorrect.
8. Flag prompts that need review.
9. End the session when finished.

## Learner Computer Instructions

On the learner computer, open the host computer's Wi-Fi address.

Example:

```txt
http://192.168.1.45:3000/player
```

Then:

1. Enter the room code shown on the host screen.
2. Enter the participant names for the learner computer.
3. Click `Join simulation`.
4. Follow the prompt monitor after the host starts the session.
5. Respond verbally or perform the skill in person.
6. For Stroke activities, drag the cards into the columns on the learner screen and use the available checks.

## How To Find The Host Computer's Local IP Address

The easiest way is to read the address printed when you run:

```powershell
npm run dev
```

Look for:

```txt
Player/other device URL: http://192.168.x.x:3000
```

You can also find it manually on Windows:

```powershell
ipconfig
```

Look for the Wi-Fi adapter and find the `IPv4 Address`.

It usually looks like:

```txt
192.168.1.45
```

Use that number like this:

```txt
http://192.168.1.45:3000/player
```

## How WebSockets Work In Simple Terms

A normal website request is like asking once:

```txt
Browser: Give me the page.
Server: Here is the page.
```

A WebSocket is like keeping a phone call open:

```txt
Host screen: I opened the Chest Tube station.
Server: I will instantly tell the learner screen.
Host screen: I advanced to the dislodgement scenario.
Server: I will instantly update the learner prompt monitor.
Learner screen: I sent an optional note.
Server: I will instantly show it to the host.
```

That open connection is why both screens update quickly.

## How Two Computers Communicate Over Wi-Fi

When both computers are on the same Wi-Fi network, they can usually talk to each other using local addresses.

The host computer has an address like:

```txt
192.168.1.45
```

The learner computer opens that address in the browser. The browser connects to the Node.js server running on the host computer.

## Results And Saved Data

The host computer stores saved session results in:

```txt
data/results.json
```

The browser may also store temporary local result history using localStorage.

The Results page can show:

- completion time
- competency score
- prompts evaluated
- correct, partial, and incorrect counts
- flagged review items
- saved score history

The Results page can also:

- export CSV
- export JSON
- reset saved data

## Reset Saved Data

From the website:

1. Open `/results`.
2. Click `Reset`.

Manual reset:

1. Stop the server.
2. Delete this file if it exists:

```txt
data/results.json
```

3. Start the server again:

```powershell
npm run dev
```

## Firewall Troubleshooting

If the learner computer cannot open the host address, Windows Firewall may be blocking Node.js.

Try this:

1. Stop the server with `Ctrl + C`.
2. Run `npm run dev` again.
3. If Windows asks whether to allow Node.js on the network, click `Allow`.
4. Choose private networks if asked.

Also check:

- Both computers are on the same Wi-Fi.
- The learner is using the host computer's IP address, not its own IP address.
- The URL includes `:3000`.
- The host terminal is still running.
- VPNs are turned off if they block local network traffic.
- Guest Wi-Fi networks may block device-to-device connections.

## Local Deployment

For normal use during practice on Windows, use:

```txt
start-game.bat
```

For manual terminal use, run:

```powershell
npm run dev
```

For a production-style local build, run:

```powershell
npm run build
npm run start
```

Then open:

```txt
http://localhost:3000
```

Other devices still connect with:

```txt
http://HOST_IP_ADDRESS:3000
```

## Screenshot Placeholders

Add your own screenshots here later:

```txt
docs/screenshots/home.png
docs/screenshots/host.png
docs/screenshots/player.png
docs/screenshots/results.png
```

Suggested screenshots:

- Home page station cards
- Host room code screen
- Host Chest Tube prompt with rubric
- Learner prompt monitor
- Results dashboard

## Editing Stations Later

Open:

```txt
src/data/stations.ts
```

Each station has this general shape:

```ts
{
  id: "chest-tube",
  title: "Chest Tube Competency",
  shortTitle: "Chest Tube",
  description: "Assessment, suction verification, troubleshooting, and emergency response.",
  estimatedMinutes: 18,
  competencyType: "Practical assessment and emergency troubleshooting",
  accent: "scrub",
  prompts: []
}
```

Each prompt has this general shape:

```ts
{
  id: "chest-tube-clamping",
  stationId: "chest-tube",
  type: "verbal-response",
  title: "Safe Clamping",
  scenario: "The learner is asked whether it is acceptable to clamp a chest tube.",
  instructions: [
    "Explain when clamping is allowed.",
    "Name brief troubleshooting exceptions."
  ],
  expectedResponse: "A chest tube should not be clamped unless specifically ordered by a physician...",
  explanation: "Unnecessary clamping can prevent air or fluid from escaping...",
  evaluationCriteria: [
    "States that clamping requires a physician order.",
    "Identifies brief clamping during Pleur-evac change.",
    "Identifies brief clamping during air leak assessment."
  ]
}
```

## Common Commands

Install dependencies:

```powershell
npm install
```

Start the local server:

```powershell
npm run dev
```

Build the app:

```powershell
npm run build
```

Start the built app:

```powershell
npm run start
```

Stop the server:

```txt
Ctrl + C
```
