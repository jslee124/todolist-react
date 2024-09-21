import Todo from "./components/Todo";
import Form from "./components/Form";
import FilterButton from "./components/FilterButton";
import { useState, useRef, useEffect } from "react";
import { nanoid } from "nanoid";

const FILTER_MAP = {
  All: () => true,
  Active: (task) => !task.completed,
  Completed: (task) => task.completed,
};
const FILTER_NAMES = Object.keys(FILTER_MAP);

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}


function App(props) { 
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [editCount, setEditCount] = useState(0);
  
  useEffect(()=>{
    fetch("http://localhost:8080/todo/all").then((res) => {
      return res.json()
    }).then((todos) => {
      setTasks(todos);
    })
  }, [editCount])

  const taskList = tasks
  .filter(FILTER_MAP[filter])
  .map((task) => (
    <Todo
      id={task.id}
      name={task.name}
      completed={task.completed}
      key={task.id}
      toggleTaskCompleted={toggleTaskCompleted}
      deleteTask={deleteTask}
      editTask={editTask}
    />
  ));
  
  const filterList = FILTER_NAMES.map((name) => (
    <FilterButton
      name={name}
      key={name}
      isPressed={name===filter}
      setFilter={setFilter}  
    />
  ));  
  
  function toggleTaskCompleted(id) {
    const updatedTasks = tasks.map((task) => {
      // if this task has the same ID as the edited task
      if (id === task.id) {
        // use object spread to make a new object
        // whose `completed` prop has been inverted
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    setTasks(updatedTasks);
  }

  function deleteTask(id) {
    fetch("http://localhost:8080/todo/delete?id=" + id, {method:"post"}).then(
      (res) => {
        console.log(res.text());
        setEditCount(editCount + 1);
      }
    )
  }
  
  function editTask(id, newName) {
    const editedTaskList = tasks.map((task) => {
      // if this task has the same ID as the edited task
      if (id === task.id) {
        // Copy the task and update its name
        return { ...task, name: newName };
      }
      // Return the original task if it's not the edited task
      return task;
    });
    setTasks(editedTaskList);
  }
  

  function addTask(name) {
    fetch("http://localhost:8080/todo/add?name=" + name + "&isCompleted=false", {method:"post"}).then(
      (res) => {
        console.log(res.text());
        setEditCount(editCount + 1);
      }
    )
  }  
  
  const tasksNoun = taskList.length !== 1 ? "tasks" : "task";
  const headingText = `${taskList.length} ${tasksNoun} remaining`;

  const listHeadingRef = useRef(null);
  const prevTaskLength = usePrevious(tasks.length);

  useEffect(() => {
    if (tasks.length < prevTaskLength) {
      listHeadingRef.current.focus();
    }
  }, [tasks.length, prevTaskLength]);  
  
  return (
    <div className="todoapp stack-large">
      <h1>Todo List</h1>
      <Form addTask={addTask}/>
      <div className="filters btn-group stack-exception">
        {filterList}
      </div>
      <h2 id="list-heading" tabIndex="-1" ref={listHeadingRef}>
        {headingText}
      </h2>

      <ul
        role = "list" 
        className="todo-list stack-large stack-exception"
        aria-labelledby="list-heading">
        {taskList}
      </ul>
    </div>
  );
}


export default App;
