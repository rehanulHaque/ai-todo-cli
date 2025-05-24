import {db} from "./db/index.js"
import {todosTable} from './db/schema.js';
import OpenAI from "openai";
import {ilike, eq} from 'drizzle-orm'
import readlineSync from 'readline-sync'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function getTodos() {
  const data = await db.select().from(todosTable)
  return data
}

async function createTodo(title) {
  const [todo] = await db.insert(todosTable).values({title}).returning({id: todosTable.id})
  return todo.id
}

async function searchTodo(text){
  const data = await db.select().from(todosTable).where(ilike(todosTable.title, `%${text}%`))
  return data
}

async function deleteById(id) {
  await db.delete(todosTable).where(todosTable.id, eq(id))
}

async function updateToobyId(text){
  await db.update(todosTable).set({completed: true}).where(ilike(todosTable.title, `%${text}%`))
}

const tools = {
  getTodos,
  createTodo,
  deleteById,
  searchTodo,
updateToobyId
}

const SYSTEM_PROMPT = `
You are an ai assistant with START, PLAN, ACTION, OBSERVE and output state.
you wait for the user prompt and first plan using available tools.
After planning take action with apporiate tools and wait for observation based on action.
Once you get the observation, Return the ai response based on start prompts and observation

You are an AI To-Do assistant. You can manage task by viewing, adding, updating, deleting todos. You must strictily follow the JSON output fromat.

Todo DB Schema:
id: Int as primary key
title: String
completed: Boolean default false
createdAt: Date defaultNow
updatedAt: Date

Available Tools:
- getTodos(): return all the todos from database
- createTodo(title: string): create a new todo and add it to databse and take title as string and returns the created todo id
- deleteById(id: string): delete a todo by id from database
- searchTodo(text: string): search a todo by title from database
- updateToobyId(id: string): update a todo by id from database

Example:
START
{"type": "user", "user": "Add a task for shopping grocries"}
{"type": "plan", "plan": "I will try to get more context of what user need to shop"}
{"type": "output", "output": "Can you tell me what items you want to shop for?"}
{"type": "user", "user": "I want to shop for milk, eggs, fish, meat"}
{"type": "plan", "plan": "I will use createTodo  to create a new todo in DB"}
{"type": "action", "function": "createTodo", "input": "Shopping for milk, eggs, fish, meat"}
{"type": "observation", "observation": "2"}
{"type": "output", "output": "You todo has been added sucessfully"}
`;


const messages = [{role: "system", content: SYSTEM_PROMPT}]

while (true) {
  const query = readlineSync.question(">> ")
  const userMessage = {
    type: "user",
    user: query
  }
  messages.push({role: "user", content: JSON.stringify(userMessage)})

  while (true) {
    const chat = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      response_format: {type: "json_object"}
    })
    const result = chat.choices[0].message.content
    messages.push({role: "assistant", content: result})
    const action = JSON.parse(result)
    if(action.type === 'output'){
      console.log(action.output)
      break
    } else if (action.type === 'action'){
      const fn = tools[action.function]
      if(!fn){
        throw new Error("Invalid Tool Call")
      }
      const observation = await fn(action.input)
      const observationMessage = {
        type: "observation",
        observation: observation
      }
      messages.push({role: "developer", content: JSON.stringify(observationMessage)})
    }
  }
}