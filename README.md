# Competency Stations

Competency Stations is a local-network medical review game website. It is designed for two computers on the same Wi-Fi network:

- The host computer runs the server and opens `http://localhost:3000/host`.
- The player computer opens the host computer's Wi-Fi address, like `http://192.168.1.45:3000/player`.

No Supabase, Firebase, Socket.IO, accounts, cloud database, or external syncing service is required.

## What This App Includes

- Cinematic home page
- Host mode with room code, Jeopardy-style station board, timer, answer reveal, live answer view, and score controls
- Player mode with room join, ready button, live synced prompt, answer submit, feedback, and live score
- Flashcard study mode
- Quick quiz mode
- Results dashboard
- CSV and JSON export
- Local reset controls
- Node.js native WebSocket server
- JSON file persistence on the host computer
- Browser localStorage progress for study and quiz backup

## The Current Stations

The station categories are ready for your real questions:

- Code Blue
- Hemodynamics
- Pacemaker
- Chest tube
- Code BERT
- Stroke
- CAUTI/CLABSI prevention
- Pressure Injury Station

Starter sample questions live in:

```txt
src/data/questions.ts
```

You can replace those with the real questions later.

## What Is Node.js?

Node.js lets your computer run JavaScript outside the browser.

For this project, Node.js does two jobs:

1. It serves the website pages.
2. It runs the WebSocket server that lets the host screen and player screen talk instantly.

The player computer does not need Node.js because it only opens the website in a browser.

## Why Only The Host Computer Needs Node.js

Think of the host computer as the mini local server for the game.

The host computer says:

```txt
I am running the game. Other computers on this Wi-Fi can connect to me.
```

The player computer only says:

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

Run:

```powershell
npm run dev
```

You should see something like:

```txt
Competency Stations is running on http://localhost:3000
Player/other device URL: http://192.168.1.45:3000
```

Keep this terminal open while using the game.

## Host Computer Instructions

On the host computer, open:

```txt
http://localhost:3000/host
```

Then:

1. Click `Create room`.
2. Tell the player the room code.
3. Start the session.
4. Select station questions.
5. Start timers, reveal answers, and mark correct or incorrect.

## Player Computer Instructions

On the player computer, open the host computer's Wi-Fi address.

Example:

```txt
http://192.168.1.45:3000/player
```

Then:

1. Enter the room code shown on the host screen.
2. Enter a player name.
3. Click `Join room`.
4. Click `Ready`.
5. Answer questions when the host selects them.

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

A normal website request is like asking one question:

```txt
Browser: Give me the page.
Server: Here is the page.
```

A WebSocket is like keeping a phone call open:

```txt
Host screen: I selected a question.
Server: I will instantly tell the player screen.
Player screen: I submitted an answer.
Server: I will instantly tell the host screen.
```

That open connection is why actions update quickly on both computers.

## How Two Computers Communicate Over Wi-Fi

When both computers are on the same Wi-Fi network, they can usually talk to each other using local addresses.

The host computer has an address like:

```txt
192.168.1.45
```

The player computer opens that address in the browser. The browser connects to the Node.js server running on the host computer.

## Results And Saved Data

The host computer stores game results in:

```txt
data/results.json
```

The browser also stores study and quick quiz progress using localStorage.

The Results page can:

- show total questions answered
- show accuracy
- show score history
- show weakest categories from quiz attempts
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

If the player computer cannot open the host address, Windows Firewall may be blocking Node.js.

Try this:

1. Stop the server with `Ctrl + C`.
2. Run `npm run dev` again.
3. If Windows asks whether to allow Node.js on the network, click `Allow`.
4. Choose private networks if asked.

Also check:

- Both computers are on the same Wi-Fi.
- The player is using the host computer's IP address, not its own IP address.
- The URL includes `:3000`.
- The host terminal is still running.
- VPNs are turned off if they block local network traffic.
- Guest Wi-Fi networks may block device-to-device connections.

## Local Deployment

For normal use during practice, run:

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

- Home page
- Host room code screen
- Active station question
- Player answer screen
- Results dashboard

## Editing The Questions Later

Open:

```txt
src/data/questions.ts
```

Each question uses this structure:

```ts
{
  id: "code-blue-100",
  category: "Code Blue",
  points: 100,
  type: "multiple-choice",
  prompt: "Question text goes here",
  choices: ["Choice A", "Choice B", "Choice C", "Choice D"],
  answer: "Choice B",
  explanation: "Why this answer is correct"
}
```

For short-answer questions, remove `choices`.

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
