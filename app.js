const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
app.use(express.json())
const dbpath = path.join(__dirname, 'cricketTeam.db')
let db = null
const initilizerServeAndDatabase = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error : ${e.message}`)
    process.exit(1)
  }
}
initilizerServeAndDatabase()

const convertDbObjectToResponseObject = obj => {
  return {
    playerId: obj.player_id,
    playerName: obj.player_name,
    jerseyNumber: obj.jersey_number,
    role: obj.role,
  }
}
//GET API
app.get('/players/', async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      cricket_team
    ORDER BY
      player_id;`
  const booksArray = await db.all(getBooksQuery)
  response.send(
    booksArray.map(eachValue => convertDbObjectToResponseObject(eachValue)),
  )
})
module.exports = app

//get single API
app.get('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const databaseQeary = `
       SELECT 
       *
       FROM 
       cricket_team
       WHERE player_id = ${playerId};
  `
  const results = await db.get(databaseQeary)
  response.send(convertDbObjectToResponseObject(results))
})

// post means create the row

app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const addCricketDetails = `
 INSERT INTO 
 cricket_team (player_name , jersey_number,role)
 VALUES
 (
    ${playerName},
    ${jerseyNumber},
    ${role}
 )
 `
  await db.run(addCricketDetails)
  response.send('Player Added to Team')
})

//update means put API
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName, jerseyNumber, role} = request.body

  const playersQueary = `
UPDATE
cricket_team
SET
player_name = ${playerName},
jersey_number = ${jerseyNumber}
role = ${role}
WHERE player_id = ${playerId};
`
  const updateResult = await db.run(playersQueary)
  response.send('Player Details Update')
})

// delete from database
app.delete('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const deleteFromDatabase = `
  DELETE FROM cricket_team
  WHERE player_id = ${playerId}
  `
  const deleteResult = await db.run(deleteFromDatabase)
  response.send('Player Removed')
})