const { 
  existsLaunchWithId,
  getAllLaunches, 
  scheduleNewLaunch, 
  abortLaunchById } = require("../../models/launches.model");

const { getPagination } = require("../../services/queries/paginations.query");

async function httpGetAllLaunches(req, res) {
  const query = getPagination(req.query);
  const launches = await getAllLaunches(query.skip, query.limit);

  return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body

  if (!launch.mission || !launch.rocket || !launch.target || !launch.launchDate) {
    return res.status(400).json({
      error: "Missing required launch property"
    })
  }

  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: "Invalid launch date"
    })
  }

  console.log(launch)

  await scheduleNewLaunch(launch);

  return res.status(201).json(launch)
}

async function httpAboutLaunch(req, res) {
  const launchId = Number(req.params.id);
  const existLaunch = await existsLaunchWithId(launchId)

  if (!existLaunch) {

    return res.status(404).json({
      error: "Launch not found"
    })
  }

  if (!existLaunch.success || !existLaunch.upcoming) {
    return res.status(400).json({
      error: "Launch already aborted"
    })
  }

  const aborted = await abortLaunchById(launchId)

  if (!aborted) {
    return res.status(404).json({
      error: "Launch not aborted"
    })
  }

  return res.status(200).json({
    Message: "ABORTED",
    Ok: aborted
  })
}

module.exports = { httpGetAllLaunches, httpAddNewLaunch, httpAboutLaunch };