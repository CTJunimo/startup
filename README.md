# Your startup name here

[My Notes](notes.md)

Tic-tac-toe (singleplayer against bots or multiplayer)

> [!NOTE]
> This is a template for your startup application. You must modify this `README.md` file for each phase of your development. You only need to fill in the section for each deliverable when that deliverable is submitted in Canvas. Without completing the section for a deliverable, the TA will not know what to look for when grading your submission. Feel free to add additional information to each deliverable description, but make sure you at least have the list of rubric items and a description of what you did for each item.

> [!NOTE]
> If you are not familiar with Markdown then you should review the [documentation](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) before continuing.

### Elevator pitch

I’m making a tic‑tac‑toe game that starts simple but has a fun twist. The Xs and Os  have their own sound effects, and you can choose whether to play against a bot or a real person. If you pick a bot, you get to choose which one — each bot would have its own difficulty level and a little personality, shown through short word bubbles and reactions during the match.

### Design

![Design image](https://github.com/user-attachments/assets/664562a8-bac2-4d4d-892f-e123962b53bf)

### Key features

- Graphical user interface
- Bots to play against
- Ability to play against people remotely


### Technologies

I am going to use the required technologies in the following ways.

- **HTML** - I’ll use basic HTML structure to organize the main parts of the application, including the login page, the game board, the bot‑selection screen, and the match history page.
- **CSS** - CSS will handle the styling and animations for the game board, the X and O placement effects, bot dialogue bubbles, and the overall theme of the app. I’ll use CSS transitions for things like tile highlights, sound‑effect animations, and personality reactions from the bots. The layout will be responsive so the game works on different screen sizes.
- **React** - React will manage the interactive UI using components such as Login, GameBoard, BotSelector, PlayerSelector, BotDialogue, and MatchHistory. Routing will switch between screens (login → menu → game → results). React state will track turns, board state, bot difficulty, and dialogue messages. User actions (placing X or O, selecting a bot, starting a match) will trigger backend calls.
- **Service** - The backend will provide endpoints for registering, logging in, starting a game, making moves, retrieving bot profiles, and saving match results. It will also handle game logic for bot moves. I’ll include a third‑party API call to get a random image to be used for each player as a profile image of sorts. [Here is the API link](https://api.api-ninjas.com/v1/randomimage).
- **DB/Login** - The database will store user accounts, match history, bot profiles (difficulty level, personality traits, dialogue lines), and any cosmetic settings the user chooses. This lets players log in and see their past games or reuse their preferred bot.
- **WebSocket** - WebSockets will be used for real‑time communication. This includes sending moves instantly during multiplayer games, updating the board for both players, and pushing bot reactions or dialogue messages during single‑player matches. WebSockets ensure the game feels responsive and alive, even when playing against a bot.

## 🚀 Specification Deliverable

> [!NOTE]
> Fill in this sections as the submission artifact for this deliverable. You can refer to this [example](https://github.com/webprogramming260/startup-example/blob/main/README.md) for inspiration.

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] I completed the prerequisites for this deliverable (Git commit requirement)
- [x] Proper use of Markdown
- [x] A concise and compelling elevator pitch
- [x] Description of key features
- [x] Description of how you will use each technology including your 3rd party API and use of WebSocket
- [x] One or more rough sketches of your application. Images must be embedded in this file using Markdown image references.

## 🚀 AWS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **Rented EC2 server** - I did not complete this part of the deliverable.
- [x] **Leased domain name** - I did not complete this part of the deliverable.
- [x] **Server accessible** from my domain: [https://playtictactoe.click](https://playtictactoe.click) - I did not complete this part of the deliverable.

## 🚀 HTML deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits)
- [x] **HTML pages** - I did not complete this part of the deliverable.
- [x] **Proper HTML element usage** - I did not complete this part of the deliverable.
- [x] **Links** - I did not complete this part of the deliverable.
- [x] **Text** - I did not complete this part of the deliverable.
- [x] **3rd party API placeholder** - I did not complete this part of the deliverable.
- [x] **Images** - I did not complete this part of the deliverable.
- [x] **Login placeholder** - I did not complete this part of the deliverable.
- [x] **DB data placeholder** - I did not complete this part of the deliverable.
- [x] **WebSocket placeholder** - I did not complete this part of the deliverable.

## 🚀 CSS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits)
- [x] **Visually appealing colors and layout. No overflowing elements.** - I used a green, coral, and yellow palette with a consistent visual hierarchy and checked desktop and mobile widths.
- [x] **Use of a CSS framework** - Bootstrap provides the responsive grid, form controls, buttons, and table utilities.
- [x] **All visual elements styled using CSS** - Shared styles define the navigation, forms, player card, game board, match updates, and history table.
- [x] **Responsive to window resizing using flexbox and/or grid display** - Bootstrap's grid and custom flexbox/grid rules adapt all screens for mobile and desktop.
- [x] **Use of a imported font** - DM Sans and Space Grotesk are imported from Google Fonts.
- [x] **Use of different types of selectors including element, class, ID, and pseudo selectors** - The stylesheet uses element, class, ID, and pseudo selectors.

## 🚀 React part 1: Routing deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits)
- [x] **Bundled using Vite** - Vite builds the React application into the `dist` directory.
- [x] **Components** - Reusable React components compose the sign-in, opponent selection, game board, and match history screens.
- [x] **Router** - React Router switches between the application screens using hash-based routes for static hosting.

## 🚀 React part 2: Reactivity deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits)
- [x] **All functionality implemented or mocked out** - The app supports optional guest/account play, three bot difficulties and personalities, per-account local match history, and real-time two-client matches through a WebSocket matchmaking server. Authentication and history remain browser-local; production multiplayer requires the server and `/ws` reverse proxy described in `server/README.md`.
- [x] **Hooks** - `useState` drives account, board, and interface state. `useEffect` synchronizes local storage, listens for cross-tab changes, records completed matches, and manages WebSocket connections and cleanup.

## 🚀 Service deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits)
- [ ] **Node.js/Express HTTP service** - I did not complete this part of the deliverable.
- [ ] **Static middleware for frontend** - I did not complete this part of the deliverable.
- [ ] **Calls to third party endpoints** - I did not complete this part of the deliverable.
- [ ] **Backend service endpoints** - I did not complete this part of the deliverable.
- [ ] **Frontend calls service endpoints** - I did not complete this part of the deliverable.
- [ ] **Supports registration, login, logout, and restricted endpoint** - I did not complete this part of the deliverable.
- [ ] **Uses BCrypt to hash passwords** - I did not complete this part of the deliverable.

## 🚀 DB deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits)
- [ ] **Stores data in MongoDB** - I did not complete this part of the deliverable.
- [ ] **Stores credentials in MongoDB** - I did not complete this part of the deliverable.

## 🚀 WebSocket deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits)
- [x] **Backend listens for WebSocket connection** - `server/index.js` provides an in-memory matchmaking and authoritative tic-tac-toe service on `/ws`.
- [x] **Frontend makes WebSocket connection** - The React game connects to `/ws`; Vite proxies this path to the local server during development.
- [x] **Data sent over WebSocket connection** - Clients send join and move messages; the server validates turns and broadcasts room state.
- [x] **WebSocket data displayed** - Both boards, turn indicators, results, and match activity update from server messages.
- [ ] **Application is fully functional in production** - Two-client play is verified locally. Production requires deploying the Node process and configuring the TLS reverse proxy described in `server/README.md`.

## Modifications (README)

### React reactivity deliverable

- Added an optional local mock account flow with registration, sign-in, sign-out, persisted player profiles, and guest access to every game route.
- Added persistent per-account match history with a clear-history action.
- Added an authoritative WebSocket matchmaking server, synchronized two-player turns, server-validated results, shared restart, and real match activity.
- Added Vite development proxy setup and production instructions; the existing React deployment script still deploys only static files.
- Added the author's GitHub repository link to the home screen.
- No passwords are stored. Authentication and match history remain local mocks. Production multiplayer still requires a running server process and TLS reverse-proxy configuration.
