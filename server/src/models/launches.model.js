const axios = require("axios");

const launchesDB = require('./launches.mongo');
const planets = require("./planets.mongo")

const DEFAULT_FLIGHT_NUMBER = 100;

var URL_API_SPACEX = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunches() {
  console.log("Downloading LaunchData..")

  const result = await axios.post(URL_API_SPACEX, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1
          }
        },
        {
          path: "payloads",
          select: {
            customers: 1
          }
        }
      ]
    }
  })

  const launchDocs = result.data.docs;

  for(let launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload)=>{
      return payload["customers"]
    })

    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket.name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers
    }

    await saveLaunch(launch);
  }
}

async function loadLaunchesData() {
  const existLaunch = await findLaunch({
    flightNumber: 1,
    mission: "FalconSat"
  })

  if (existLaunch) {
    console.log("The Launch already exists")
  } else {
    await populateLaunches();
  }
}

async function findLaunch(filter) {
  return await launchesDB.findOne(filter)
}

async function existsLaunchWithId(launchId) {
  return await findLaunch({
    flightNumber: launchId
  })
}

async function getLatestFlightNumber() {
 const latestLaunch = await launchesDB.findOne().sort('-flightNumber'); //'-flightNumber' means 'descending order

return latestLaunch ? latestLaunch.flightNumber : DEFAULT_FLIGHT_NUMBER;
}

function getAllLaunches(skip, limit) {
  return launchesDB.find({}, {
    '_id': 0, '__v': 0})
    .sort({flightNumber: 1})
    .skip(skip)
    .limit(limit)
}

async function saveLaunch(launch) {

  return await launchesDB.findOneAndUpdate({ //"findOneAndUpdate" show(in the response) just information passed on the second arg, while "updateOne" pass a plus information called "$setOnInsert". This can become vulnerable passing what kind of DB we are using to a hacker.
    flightNumber: launch.flightNumber
  }, launch,{
    upsert: true
  })
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target
  });

  if (!planet) {
    throw new Error('No matching planet found');
  }

  const latestFlightNumber = await getLatestFlightNumber();

  const newLaunch = Object.assign(launch, {
    flightNumber: latestFlightNumber + 1,
    customers: ["Zero to Mastery", "NASA"],
    upcoming: true,
    success: true,
  })

  await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
  const aborted = await launchesDB.updateOne({
    flightNumber: launchId
  }, {
    upcoming: false,
    success: false
  })

  return aborted.modifiedCount === 1;
}

module.exports = {
  loadLaunchesData,
  existsLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch, 
  abortLaunchById
}