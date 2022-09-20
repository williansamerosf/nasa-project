const express = require("express");

const { httpGetAllLaunches, httpAddNewLaunch, httpAboutLaunch } = require("./launches.controller");

const launchesRouter = express.Router();

launchesRouter.get("/", httpGetAllLaunches);
launchesRouter.post("/", httpAddNewLaunch);
launchesRouter.delete("/:id", httpAboutLaunch);

module.exports = launchesRouter;