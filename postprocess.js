import { readJSON, writeCSV, removeFile } from 'https://deno.land/x/flat@0.0.10/mod.ts' 

const filename = Deno.args[0]
const json = await readJSON(filename)

const roundHundredth = x => +parseFloat(x).toFixed(2)

const replaceMonth = date => (
  date
    .replace("Jan", "01")
    .replace("Feb", "02")
    .replace("Mar", "03")
    .replace("Apr", "04")
    .replace("May", "05")
    .replace("Jun", "06")
    .replace("Jul", "07")
    .replace("Aug", "08")
    .replace("Sep", "09")
    .replace("Oct", "10")
    .replace("Nov", "11")
    .replace("Dec", "12")
)

// https://www.minorplanetcenter.net/iau/info/UValue.html#Ref1
const orbitCondition = {
  "0": "Extremely Certain",
  "1": "Extremely Certain",
  "2": "Very Certain",
  "3": "Moderately Certain",
  "4": "Slightly Certain",
  "5": "Slightly Uncertain",
  "6": "Moderately Uncertain",
  "7": "Very Uncertain",
  "8": "Extremely Uncertain",
  "9": "Extremely Uncertain"
} 

const makeAsteroidRecord = asteroid => (
  {
    close_approach_datetime: replaceMonth(asteroid.close_approach_data[0].close_approach_date_full),
    name: asteroid.name,
    min_diameter_m: roundHundredth(asteroid.estimated_diameter.meters.estimated_diameter_min),
    max_diameter_m: roundHundredth(asteroid.estimated_diameter.meters.estimated_diameter_max),
    relative_velocity_kmps: roundHundredth(asteroid.close_approach_data[0].relative_velocity.kilometers_per_second),
    miss_distance_lunar: roundHundredth(asteroid.close_approach_data[0].miss_distance.lunar),
    orbiting_body: asteroid.close_approach_data[0].orbiting_body,
    //orbit_condition: orbitCondition[asteroid.orbital_data.orbit_uncertainty],
    orbit_uncertainty: asteroid.orbital_data.orbit_uncertainty,
    orbit_determination_datetime: asteroid.orbital_data.orbit_determination_date,
    first_observation_date: asteroid.orbital_data.first_observation_date,
    last_observation_date: asteroid.orbital_data.last_observation_date,
    observations_used: asteroid.orbital_data.observations_used,  
    is_potentially_hazardous: asteroid.is_potentially_hazardous_asteroid,
    is_sentry_object: asteroid.is_sentry_object,
  }
)

const asteroidRecords = []
for (const asteroids of Object.values(json.near_earth_objects)) {  // loop through days
  asteroidRecords.push(...asteroids.map(asteroid => makeAsteroidRecord(asteroid)))
}

asteroidRecords.sort(
  (a, b) => new Date(a.close_approach_datetime) - new Date(b.close_approach_datetime)
)

console.log(asteroidRecords)

const newFilename = `${filename.split('.').slice(0, -1).join('.')}-postprocessed.csv`
await writeCSV(newFilename, asteroidRecords)

await removeFile(filename)