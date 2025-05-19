// src/socket/socketServer.ts

import { Server } from "socket.io";
import http from "http";

// Crée un serveur HTTP pour le lier à Socket.IO
const httpServer = http.createServer();

const io = new Server(httpServer, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

// Gère la connexion des clients
io.on("connection", (socket) => {
    console.log("Client connecté via Socket.IO :", socket.id);

    socket.on("disconnect", () => {
        console.log("Client déconnecté :", socket.id);
    });
});

// Fonction pour envoyer le pourcentage à tous les clients connectés
export const sendProgressToClients = (pourcentage: number ,treatedUrlIndex: number) => {
    io.emit("progress", {
        pourcentage,      
        treatedUrlIndex,     // nombre total d'URLs à traiter
      });
    };
    export const sendUrlsToClients = ( urlsList: String[]) => {
        io.emit("initiateAnalyse", {
            urlsList,    // nombre total d'URLs à traiter
          });
        };
httpServer.listen(8080, () => {
    console.log("✅ Serveur Socket.IO lancé sur le port 8080");
});
