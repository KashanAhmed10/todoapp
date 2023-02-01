/* src/App.js */
import React, { useEffect, useState } from "react"
import { Amplify, API, graphqlOperation } from "aws-amplify"
import { createTodo, deleteTodo, updateTodo } from "./graphql/mutations"
import { listTodos } from "./graphql/queries"
import { withAuthenticator } from "@aws-amplify/ui-react"
import "./App.css"
import awsExports from "./aws-exports"
Amplify.configure(awsExports)

const initialState = {  name: "", description: "" }

const App = () => {
  const [formState, setFormState] = useState(initialState)
  const [todos, setTodos] = useState([]);
  const [createData, setCreateData] = useState();
  const [updateData, setUpdateData] = useState();
  const [id, setId] = useState('');
  const [tdelete, setdelete] = useState()


  useEffect(() => {
    fetchTodos()
  }, [tdelete, createData, updateData])

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }

  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos))
      const todos = todoData.data.listTodos.items
      setTodos(todos)
    } catch (err) {
      console.log("error fetching todos")
    }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return
      const todo = { ...formState }
      setTodos([...todos, todo])
      setFormState(initialState)
      const data =  await API.graphql(graphqlOperation(createTodo, { input: todo }));
      setCreateData(data)
    } catch (err) {
      console.log("error creating todo:", err)
    }
  }
  const deletetodo = async (id) => {
    const tod = await API.graphql(
      graphqlOperation(deleteTodo, { input: { id } })
    )
    setdelete(tod)
  }

  const updatetodo = async () => {
   const data=  await API.graphql(graphqlOperation(updateTodo, {input: {
      id: id,
      name: formState.name,
      description: formState.description
    }}))
    setUpdateData(data)
  }

  const handleCreateAndUpdate = async () => {
    if(!id) {
      await addTodo();
    } else {
      await updatetodo();
      setFormState(initialState)
    }
  }
  return (
    <div style={styles.container}>
      <h2>Todos</h2>
      <input
        onChange={(event) => setInput("name", event.target.value)}
        style={styles.input}
        value={formState.name}
        placeholder="Name"
      />
      <input
        onChange={(event) => setInput("description", event.target.value)}
        style={styles.input}
        value={formState.description}
        placeholder="Description"
      />
      <button style={styles.button} onClick={handleCreateAndUpdate}>
        {!id
          ? "Create Todo"
          : "Update Todo"}
      </button>


      <div className='form-data'>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              
            </tr>
          </thead>
          <tbody>
            {todos.map((todo, index) => {
              return (
                <tr key={todo.id ? todo.id : index} style={styles.todo}>
                  
                  <td>{todo.name}</td>
                  <td>{todo.description}</td>
                  <td><button type="button" class="btn btn-danger" onClick={() => deletetodo(todo.id)}>DELETE</button></td>
                  <td>
                    <button  type="button" class="btn btn-success" onClick={() => {
                        setId(todo.id)
                      setFormState({
                name: todo.name,
                description: todo.description,
              })
            }
  
            }  >
            UPDATE
          </button></td>

               
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
  
     
       {/* {todos.map((todo, index) => (
        <div key={todo.id ? todo.id : index} style={styles.todo}>
       
          <p style={styles.todoName}>{todo.name}</p>
          <p style={styles.todoDescription}>{todo.description}</p>
          <button onClick={() => deletetodo(todo.id)}>DELETE</button>
          <button
            onClick={() => {
              setId(todo.id)
              setFormState({
                name: todo.name,
                description: todo.description,
              })
            }
  
            }  >
            UPDATE
          </button>
        </div>
      ))}
      */}
    </div>
  )
}

const styles = {
  container: {
    width: 400,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: 20,
  },
  todo: { marginBottom: 15 },
  input: {
    border: "none",
    backgroundColor: "#ddd",
    marginBottom: 10,
    padding: 8,
    fontSize: 18,
  },
  todoName: { fontSize: 20, fontWeight: "bold" },
  todoDescription: { marginBottom: 0 },
  button: {
    backgroundColor: "black",
    color: "white",
    outline: "none",
    fontSize: 18,
    padding: "12px 0px",
  },
}

export default withAuthenticator(App)
