const express = require('express')
const app = express()
app.use(express.json())
module.exports = app

const path = require('path')
const dbPath = path.join(__dirname, 'todoApplication.db')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

let db = null

const initializeServerAndDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    let port = 3000
    app.listen(port, () => {
      console.log(`Server is Running in ${port} Port...`)
    })
  } catch (error) {
    console.log(`Db Error: ${error.message}`)
    process.exit(1)
  }
}

initializeServerAndDb()

// API 1: Total Scenarios
//Function check by what parameters the query to execute

let haspriorityAndStatus = queryObject => { 
  return queryObject.priority !== undefined && queryObject.status !== undefined
}

let haspriority = queryObject => {
  return queryObject.priority !== undefined
}

let hasstatus = queryObject => {
  return queryObject.status !== undefined
}

app.get('/todos/', async (request, response) => {
  let executeQuery = ''
  const {search_q = '', priority = '', status = ''} = request.query
  // we can use in all querys search_q also if it is there it works else "" taken i.e all comes in search_q

  switch (true) {
    case haspriorityAndStatus(request.query):
      executeQuery = `SELECT * FROM todo 
    WHERE todo LIKE '%${search_q}%' AND priority='${priority}' AND status='${status}';`
      break

    case haspriority(request.query):
      executeQuery = `SELECT * FROM todo 
    WHERE todo LIKE '%${search_q}%' AND priority='${priority}';`
      break

    case hasstatus(request.query):
      executeQuery = `SELECT * FROM todo 
    WHERE todo LIKE '%${search_q}%' AND status='${status}';`
      break

    default:
      executeQuery = `SELECT * FROM todo 
    WHERE todo LIKE '%${search_q}%';`
      break
  }

  const api1RunInDb = await db.all(executeQuery)
  response.send(api1RunInDb)
})

//API 2: Returns a specific todo based on the todo ID

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  let getSearchedTodo = `SELECT * FROM todo WHERE id=${todoId}`
  const api2RunInDb = await db.get(getSearchedTodo)
  response.send(api2RunInDb)
})

//API 3: Create a todo in the todo table

app.post('/todos', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const createTodoInDb = `INSERT INTO todo(id,todo,priority,status)
VALUES(${id},'${todo}','${priority}','${status}');`
  const api3RunInDb = await db.run(createTodoInDb)
  response.send('Todo Successfully Added')
})

//API 4: update-todo,priority,status

app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const requestBodyValues = request.body

  let updatedThingName = ''
  let queryForUpdate = ''

  switch (true) {
    case requestBodyValues.status !== undefined:
      updatedThingName = 'Status'
      break
    case requestBodyValues.priority !== undefined:
      updatedThingName = 'Priority'
      break
    case requestBodyValues.todo !== undefined:
      updatedThingName = 'Todo'
      break
  }

  const oldTodoInfoInDb = `SELECT * FROM todo Where id=${todoId};`
  const oldTodoObject = await db.get(oldTodoInfoInDb)
  const {
    todo = oldTodoObject.todo,
    priority = oldTodoObject.priority,
    status = oldTodoObject.status,
  } = request.body

  const updatequery = `UPDATE todo 
  SET todo='${todo}',priority='${priority}',status='${status}';`

  const api4RunInDb = await db.run(updatequery)

  response.send(`${updatedThingName} Updated`)
})

//API 5: Delete a specific todo based on the todo ID

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  let deleteTodoById = `DELETE FROM todo WHERE id=${todoId}`
  const api5RunInDb = await db.run(deleteTodoById)
  response.send('Todo Deleted')
})
