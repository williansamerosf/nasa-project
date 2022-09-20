const http = require("http");

const app = require("./app");

require("dotenv").config();

const { mongoConnect } = require("./services/mongo/mongo");

const PORT = process.env.PORT || 8000;

const { loadPlanetsData } = require("./models/planets.model");
const { loadLaunchesData } = require("./models/launches.model");

const server = http.createServer(app);

async function startServer() {
  await mongoConnect();
  await loadPlanetsData();
  await loadLaunchesData();

  server.listen(PORT, ()=> {
    console.log("Server running on PORT", PORT, "...");
  })
}

startServer();
