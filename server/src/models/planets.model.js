const { parse } = require("csv-parse");
const fs = require("fs");
const path = require("path");

const planets = require("./planets.mongo");

function isThePlanetHabitable(planet) {
  return planet['koi_disposition'] === "CONFIRMED" 
  && planet['koi_insol'] > 0.36 
  && planet['koi_insol'] < 1.11 
  && planet['koi_prad'] < 1.6
}

function loadPlanetsData() {
  return new Promise((resolve, rejects) => {
    fs.createReadStream(path.join(__dirname, "../data/kepler_data.csv"))
      .pipe(parse({
        comment: "#",
        columns: true
      }))
      .on("data", (data) => {
        if (isThePlanetHabitable(data)) {
          savePlanet(data);
        }
      })
      .on("error", (error) => {
        console.log(error)
        rejects();
      })
      .on("end", async () => {
        const countPlanets = (await getIsAnHabitablePlanet()).length;
        console.log(`${countPlanets} possible habitable planets were found!!!`)
        console.log("Done");
        resolve();
      })
  })
}

async function getIsAnHabitablePlanet() {
  return await planets.find({}, {
    _id: 0, //in the second argument of find method, we can remove fields that we don't want to return
    __v: 0
  });
}

async function savePlanet(planet) {
  try {
    await planets.updateOne({
      keplerName: planet.kepler_name
    }, {
      keplerName: planet.kepler_name
    }, {
      upsert: true
    })
  } catch (error) {
    console.error(`Could not save the planet - ${error}`)
  }
}

  module.exports = {
    loadPlanetsData,
    getIsAnHabitablePlanet
  }