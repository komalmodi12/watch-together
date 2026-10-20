# WatchTogether: YouTube Watch Party

WatchTogether is a web app where friends can watch the same YouTube video together at the same time. One person creates a room, shares the room code or link, and everyone who joins sees the video play, pause and jump to the same place. I built it as a full stack project using React, Node.js and Socket.IO.

## Links

Live App: https://watch-together-app.netlify.app

Backend Server: https://watch-together-server-0ylv.onrender.com

Backend Health Check: https://watch-together-server-0ylv.onrender.com/health

GitHub Repository: https://github.com/komalmodi12/watch-together

The backend is hosted on the free plan of Render, so it may be asleep when you open the app. If that happens, the first connection can take up to a minute. Just wait a little and it will connect.

## What You Can Do

You can create a room and join other rooms using a room code or a shareable link. Playing, pausing, seeking and changing the video stays in sync for everyone in the room, and people who join late start from the correct time of the video.

Every room has three kinds of users. The person who creates the room is the Host. People who join are Participants by default. The Host can make a Participant a Moderator, remove someone from the room, or hand the Host role to someone else. The Host and Moderators can control the video directly. Participants cannot, but they can send a request to play, pause, seek or change the video, and the Host or a Moderator can approve or reject it.

There is also a live chat in every room. For changing the video, you can paste a normal YouTube link in different formats, such as watch links, youtu.be links, embed links or shorts links.

## How To Use It

1. Open the live app.
2. Click Create Room, type your name, and you become the Host of a new room.
3. Copy the room code or the room link and send it to your friends.
4. Your friends click Join Room and enter the code and their name. If they open your link, the code is already filled in.
5. The Host and Moderators can use the play, pause and seek controls, and paste a YouTube link to change the video.
6. Participants can use the same controls, but their action goes to the Host or a Moderator as a request. The request shows up in the Requests box, where it can be approved or rejected.
7. The Host can see the participants list and use it to give someone the Moderator role, remove them, or make them the new Host.

## How It Works

The app uses WebSockets through Socket.IO, which keeps a connection open between each browser and the server. This lets the server send updates to everyone in a room right away, without anyone refreshing the page.

The server decides what is true. Browsers never talk to each other directly. When someone presses a button, the browser sends a request to the server, the server checks if that person is allowed to do it, and then it tells everyone in the room what changed. These permission checks happen on the server, so hiding a button in the interface is not the only protection.

The server remembers the video time and the moment it was saved. That is how a person who joins later gets the right time. If someone's player drifts away from the server's time, it jumps back to match.

The main events used are create_room, join_room, leave_room, play, pause, seek, change_video, assign_role, remove_participant, transfer_host, chat_message, request_action and resolve_request. The server replies with events like sync_state, user_joined, user_left, role_assigned and participant_removed.

## Tech Stack

The frontend is built with React and React Router. The backend uses Node.js and Express, and Socket.IO handles the real-time part. Videos are played with the YouTube IFrame Player API. There is no database, and all rooms and messages are kept in the server's memory.

## Run It Locally

You need Node.js version 20 or newer.

First, clone the project.

```bash
git clone https://github.com/komalmodi12/watch-together.git
cd watch-together
```

Then set up and start the backend.

```bash
cd server
npm install
```

Create a file named .env inside the server folder with this line:

```
CLIENT_URL=http://localhost:3000
```

Now start the server.

```bash
npm run dev
```

The backend will run on http://localhost:5000

Open a second terminal for the frontend.

```bash
cd client
npm install
```

Create a file named .env inside the client folder with this line:

```
REACT_APP_SERVER_URL=http://localhost:5000
```

Now start the app.

```bash
npm start
```

The frontend will run on http://localhost:3000. To try it out, open it in two browser tabs. Each tab works like a different person.

## Environment Variables

There are only two variables.

CLIENT_URL is used by the backend. It is the address of the frontend that is allowed to connect to the server. Write it without a slash at the end.

REACT_APP_SERVER_URL is used by the frontend. It is the address of the backend server. This value is added when the app is built, so if you change it you need to build the frontend again.

Both of these are just public web addresses. No passwords or secret keys are needed, and you should not commit your .env files to GitHub.

## Deployment

The frontend is deployed on Netlify and the backend is deployed on Render. On Netlify, REACT_APP_SERVER_URL is set to the address of the Render server. On Render, CLIENT_URL is set to the address of the Netlify app.

## Project Structure

The client folder has the React app, including the pages, components, the socket context and some helper files. The server folder has the backend code inside src. In there, index.js sets up Express and Socket.IO, models has the Participant and Room classes, services has the RoomManager that keeps track of all rooms, sockets has the event handlers, and utils has the permission checks and other helpers.

## Limitations

The free Render backend can go to sleep when nobody is using it, so the first connection after a break can be slow. Rooms and chat messages are stored in memory, so they can be lost when the server restarts. Some YouTube videos do not allow embedding, and the player shows a message when that happens. Refreshing the page also removes you from the room, so you have to join again.