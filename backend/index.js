import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
dotenv.config();
const port = process.env.PORT || 3000;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const allUsers = {};
const allRooms = [];

io.on("connection", (socket) => {
  console.log("New connection", socket.id);
  allUsers[socket.id] = {
    socket: socket,
    online: true,
  };

  socket.on("request_to_play", (data) => {
    const currentUser = allUsers[socket.id];
    currentUser.playerName = data.playerName;

    let opponetPlayer;
    for (const key in allUsers) {
      const user = allUsers[key];
      if (user.socket.id !== socket.id && user.online && !user.playing) {
        opponetPlayer = user;
        break;
      }
    }

    if (opponetPlayer) {
      allRooms.push({
        player1: currentUser,
        player2: opponetPlayer,
      });

      currentUser.playing = true;
      opponetPlayer.playing = true;

      currentUser.socket.emit("opponet_found", {
        opponetPlayer: opponetPlayer.playerName,
        currentPlayer: "O",
        playingas: "O",
      });

      opponetPlayer.socket.emit("opponet_found", {
        opponetPlayer: currentUser.playerName,
        currentPlayer: "O",
        playingas: "X",
      });

      currentUser.socket.on("moveFromFrontend", (data) => {
        opponetPlayer.socket.emit("moveFrombackend", {
          ...data,
        });
      });

      opponetPlayer.socket.on("moveFromFrontend", (data) => {
        currentUser.socket.emit("moveFrombackend", {
          ...data,
        });
      });
    } else {
      currentUser.socket.emit("opponet_not_found");
    }
  });

  socket.on("disconnect", () => {
    const currentUser = allUsers[socket.id];
    currentUser.online = false;
    currentUser.playing = false;
    console.log("User disconnected", socket.id);

    for (const { player1, player2 } of allRooms) {
      if (player1.socket.id === socket.id) {
        player2.socket.emit("opponet_disconnected");
      } else if (player2.socket.id === socket.id) {
        player1.socket.emit("opponet_disconnected");
      }
    }
  });
});

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
