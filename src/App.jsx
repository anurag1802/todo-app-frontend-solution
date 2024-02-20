import { useEffect, useState } from "react";
import "./index.css";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

//images
import bgDarkDesktop from "../src/assets/images/bg-desktop-dark.jpg";
import bgLightDesktop from "../src/assets/images/bg-desktop-light.jpg";
import bgDarkMobile from "../src/assets/images/bg-mobile-dark.jpg";
import bgLightMobile from "../src/assets/images/bg-mobile-light.jpg";
import iconCheck from "../src/assets/images/icon-check.svg";
import iconCross from "../src/assets/images/icon-cross.svg";
import iconMoon from "../src/assets/images/icon-moon.svg";
import iconSun from "../src/assets/images/icon-sun.svg";

//toast notification
const taskAdded = (newTodoResponse) =>
  toast.promise(
    new Promise((resolve) => setTimeout(resolve(newTodoResponse), 5000)),
    {
      loading: "Creating...",
      success: "Task Added Successfully🎉",
      error: "Error Adding Task",
    }
  );

const taskDeleted = (deleteResponse) =>
  toast.promise(new Promise((resolve) => resolve(deleteResponse)), {
    loading: "Deleting...",
    success: "Task Deleted Successfully🎉",
    error: "Error Deleting Task",
  });

const taskCompleted = (response) =>
  toast.promise(new Promise((resolve) => resolve(response)), {
    loading: "Marking as Completed...",
    success: "Task marked as Completed",
    error: "Error Occured While Completing Task",
  });

const taskCompletedUnmarked = (response) =>
  toast.promise(new Promise((resolve) => resolve(response)), {
    loading: "Marking ad Active...",
    success: "Task marked as Active",
    error: "Error Occured While Completing Task",
  });

const taskCleared = (completedTodos) =>
  toast.promise(new Promise((resolve) => resolve(completedTodos)), {
    loading: "Clearing all completed tasks...",
    success: "All completed task are cleared",
    error: "Error occured while clearing tasks",
  });

function App() {
  const [theme, setTheme] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [todos, setTodos] = useState([]);
  const [activeItemsLength, setActiveItemsLength] = useState(0);
  const [filter, setFilter] = useState("All");
  const [newTodo, setNewTodo] = useState("");

  const apiUrl = "https://todo-app-backend-eosin.vercel.app/api/todos";

  const addTodo = async () => {
    try {
      const newTodoResponse = await axios.post(apiUrl, { title: newTodo });

      setTodos([...todos, newTodoResponse.data]);
      setNewTodo("");

      // Update activeItemsLength after deleting a todo
      setActiveItemsLength((prevCount) => prevCount + 1);

      taskAdded(newTodoResponse);
    } catch (error) {
      console.log(error);
    }
  };

  //update todo
  const updateTodoActive = async (e, item) => {
    try {
      if (e.target.checked) {
        const response = await axios.put(apiUrl + `/${item._id}`, {
          isActive: false,
          isCompleted: true,
        });

        setTodos((prevTodos) => {
          // Find the index of the todo with the matching id
          const todoIndex = prevTodos.findIndex(
            (todo) => todo._id === item._id
          );

          // Create a new array with the updated todo
          const updatedTodos = [...prevTodos];
          updatedTodos[todoIndex] = response.data;
          taskCompleted(response);

          return updatedTodos;
        });
      } else {
        const response = await axios.put(apiUrl + `/${item._id}`, {
          isActive: true,
          isCompleted: false,
        });

        setTodos((prevTodos) => {
          // Find the index of the todo with the matching id
          const todoIndex = prevTodos.findIndex(
            (todo) => todo._id === item._id
          );

          // Create a new array with the updated todo
          const updatedTodos = [...prevTodos];
          updatedTodos[todoIndex] = response.data;
          taskCompletedUnmarked(response);

          return updatedTodos;
        });
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  //delete todo
  const deleteTodo = async (e, item) => {
    try {
      const deleteResponse = await axios.delete(apiUrl + `/${item._id}`);

      //remove the deleted todo from list
      setTodos((prevTodos) =>
        prevTodos.filter((todo) => todo._id !== item._id)
      );

      // Update activeItemsLength after deleting a todo
      setActiveItemsLength((prevCount) =>
        prevCount > 0 ? prevCount - 1 : prevCount
      );

      taskDeleted(deleteResponse);
    } catch (error) {
      throw new Error(error);
    }
  };

  const handleCheckboxClick = (e, item) => {
    console.log("checked item is", item._id);
    updateTodoActive(e, item);
  };

  const handleNewTodo = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      addTodo();
    }
  };

  const handleDeleteTodo = (e, item) => {
    deleteTodo(e, item);
  };

  const handleClearCompleted = async () => {
    try {
      const completedTodos = todos.filter((item) => item.isCompleted);

      // Remove completed todos from the state
      setTodos((prevTodos) => prevTodos.filter((todo) => !todo.isCompleted));

      // Delete completed todos from the backend
      await Promise.all(
        completedTodos.map(async (completedTodo) => {
          await axios.delete(apiUrl + `/${completedTodo._id}`);
        })
      );

      taskCleared(completedTodos); // Show toast for clearing completed todos
    } catch (error) {
      throw new Error(error);
    }
  };

  useEffect(() => {
    async function getTodos() {
      try {
        setIsLoading(true);
        const res = await axios.get(apiUrl);
        const data = res.data;

        //filter logic
        let filteredTodos = [];
        if (filter === "All") {
          filteredTodos = data;
        } else if (filter === "Active") {
          filteredTodos = data.filter((item) => item.isActive);
        } else if (filter === "Completed") {
          filteredTodos = data.filter((item) => item.isCompleted);
        }

        setTodos(filteredTodos);
        setIsLoading(false);
        console.log(data);

        const activeItemsLength = data.filter((item) => item.isActive).length;
        setActiveItemsLength(activeItemsLength);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    }

    getTodos();
  }, [filter]);

  useEffect(() => {
    const toggleTheme = () => {
      if (theme) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    toggleTheme();
  }, [theme]);

  return (
    <>
      <div className="wrapper min-w-screen min-h-screen h-full pb-40 bg-checkBackground dark:bg-veryDarkBlue overflow-hidden flex flex-col justify-center items-center">
        <div className="banner-img">
          {/* desktop banner */}
          <img
            src={theme ? bgDarkDesktop : bgLightDesktop}
            alt="desktop banner image"
            className="w-screen h-56 md:h-2/3 object-cover hidden md:flex"
          />

          {/* mobile banner  */}
          <img
            src={theme ? bgDarkMobile : bgLightMobile}
            alt="mobile banner image"
            className="w-screen h-56 md:h-2/3 object-cover md:hidden"
          />
        </div>
        <div className="todo-wrapper -mt-44 md:-mt-48 flex flex-col justify-center items-center w-full">
          <div className="w-full md:w-[45%] menu-wrapper flex flex-row px-8 justify-between items-center">
            <h1 className="text-white font-bold text-3xl md:text-4xl tracking-[0.8rem]">
              TODO
            </h1>
            {theme ? (
              <img
                src={iconSun}
                alt="light-mode icon"
                className="text-white text-3xl cursor-pointer"
                onClick={() => setTheme(!theme)}
              />
            ) : (
              <img
                src={iconMoon}
                alt="dark-mode icon"
                className="text-white text-3xl cursor-pointer"
                onClick={() => setTheme(!theme)}
              />
            )}
          </div>
          <div className="relative todo-input pt-8 w-full md:w-[45%] px-5 md:px-0">
            <input
              type="text"
              placeholder="Create a new todo..."
              className="w-full py-3 px-16 rounded shadow-xl focus:outline-none text-veryDarkBlue dark:text-veryLightGray bg-veryLightGray dark:bg-veryDarkDesaturatedBlue caret-brightBlue"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={handleNewTodo}
            />
            <Toaster position="top-center" reverseOrder={false} />
            <div className="absolute top-11 left-[2.5rem] md:left-[1.3rem] right-0 bottom-0 placeholder-circle w-6 h-6 rounded-full border border-darkGrayishBlueLight border-opacity-25"></div>
          </div>
          <div className="todo-output w-full md:w-[45%] mt-5 rounded px-5 md:px-0">
            <div>
              {isLoading ? (
                <div className="w-full flex justify-center items-center p-5 rounded bg-veryLightGray dark:bg-veryDarkDesaturatedBlue text-darkerGrayishBlue dark:text-lightGrayishBlue">
                  Loading...
                </div>
              ) : todos.length > 0 ? (
                <>
                  <div className="rounded shadow-2xl">
                    {todos.map((item, index) => (
                      <div
                        key={index}
                        className="group w-full h-full py-4 px-5 first:rounded-tl first:rounded-tr border-b border-darkGrayishBlueLight border-opacity-25 flex justify-between bg-veryLightGray dark:bg-veryDarkDesaturatedBlue"
                      >
                        <div className="flex gap-x-5">
                          <label className="custom-checkbox-container">
                            <input
                              type="checkbox"
                              name={`check-name-${index}`}
                              id={`check-id-${index}`}
                              checked={item.isCompleted}
                              onChange={(e) => handleCheckboxClick(e, item)}
                              className="cursor-pointer"
                            />
                            <div className="checkmark"></div>
                          </label>

                          <p
                            className={`text-sm md:text-lg align-middle text-darkerGrayishBlue dark:text-lightGrayishBlue ${
                              item.isCompleted
                                ? "line-through text-lightGrayishBlue dark:text-darkGrayishBlueLight"
                                : ""
                            }`}
                          >
                            {item.title}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteTodo(e, item)}
                        >
                          <img
                            src={iconCross}
                            alt="delete icon"
                            className="h-4 opacity-75 hover:opacity-100"
                          />
                        </button>
                      </div>
                    ))}
                    <div className="w-full flex justify-between px-5 py-4 rounded-br rounded-bl border-b border-darkGrayishBlueLight border-opacity-25 bg-veryLightGray dark:bg-veryDarkDesaturatedBlue text-darkGrayishBlueLight">
                      <p className="text-sm">{activeItemsLength} items left</p>
                      <p className="hidden md:flex gap-x-5 text-sm">
                        <span
                          className={`hover:font-bold cursor-pointer ${
                            filter === "All" ? "font-bold text-brightBlue" : ""
                          }`}
                          onClick={() => setFilter("All")}
                        >
                          All
                        </span>
                        <span
                          className={`hover:font-bold cursor-pointer ${
                            filter === "Active"
                              ? "font-bold text-brightBlue"
                              : ""
                          }`}
                          onClick={() => setFilter("Active")}
                        >
                          Active
                        </span>
                        <span
                          className={`hover:font-bold cursor-pointer ${
                            filter === "Completed"
                              ? "font-bold text-brightBlue"
                              : ""
                          }`}
                          onClick={() => setFilter("Completed")}
                        >
                          Completed
                        </span>
                      </p>
                      <p
                        className="text-sm cursor-pointer hover:font-bold"
                        onClick={handleClearCompleted}
                      >
                        Clear Completed
                      </p>
                    </div>
                  </div>
                  <div className="w-full flex md:hidden justify-center items-center p-5 bg-veryLightGray dark:bg-veryDarkDesaturatedBlue text-darkerGrayishBlue dark:text-lightGrayishBlue mt-3 rounded shadow-2xl">
                    <p className="flex gap-x-5 text-sm">
                      <span
                        className={`hover:font-bold cursor-pointer ${
                          filter === "All" ? "font-bold text-brightBlue" : ""
                        }`}
                        onClick={() => setFilter("All")}
                      >
                        All
                      </span>
                      <span
                        className={`hover:font-bold cursor-pointer ${
                          filter === "Active" ? "font-bold text-brightBlue" : ""
                        }`}
                        onClick={() => setFilter("Active")}
                      >
                        Active
                      </span>
                      <span
                        className={`hover:font-bold cursor-pointer ${
                          filter === "Completed"
                            ? "font-bold text-brightBlue"
                            : ""
                        }`}
                        onClick={() => setFilter("Completed")}
                      >
                        Completed
                      </span>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-full flex justify-center items-center p-5 rounded bg-veryLightGray dark:bg-veryDarkDesaturatedBlue text-darkerGrayishBlue dark:text-lightGrayishBlue">
                    <p>No item available</p>
                  </div>
                  <div className="w-full flex justify-between px-5 py-4 rounded-br rounded-bl border-b border-darkGrayishBlueLight border-opacity-25 bg-veryLightGray dark:bg-veryDarkDesaturatedBlue">
                    <p className="text-sm text-darkGrayishBlueLight">
                      {activeItemsLength} items left
                    </p>
                    <p className="hidden md:flex gap-x-5 text-sm text-darkGrayishBlueLight">
                      <span
                        className={`hover:font-bold cursor-pointer ${
                          filter === "All" ? "font-bold text-brightBlue" : ""
                        }`}
                        onClick={() => setFilter("All")}
                      >
                        All
                      </span>
                      <span
                        className={`hover:font-bold cursor-pointer ${
                          filter === "Active" ? "font-bold text-brightBlue" : ""
                        }`}
                        onClick={() => setFilter("Active")}
                      >
                        Active
                      </span>
                      <span
                        className={`hover:font-bold cursor-pointer ${
                          filter === "Completed"
                            ? "font-bold text-brightBlue"
                            : ""
                        }`}
                        onClick={() => setFilter("Completed")}
                      >
                        Completed
                      </span>
                    </p>
                    <p
                      className="text-sm cursor-pointer hover:font-bold text-darkGrayishBlueLight"
                      onClick={handleClearCompleted}
                    >
                      Clear Completed
                    </p>
                  </div>
                  <div className="w-full flex md:hidden justify-center items-center p-5 rounded bg-veryLightGray dark:bg-veryDarkDesaturatedBlue text-darkerGrayishBlue dark:text-lightGrayishBlue mt-3">
                    <p className="flex gap-x-5 text-sm">
                      <span
                        className={`hover:font-bold cursor-pointer ${
                          filter === "All" ? "font-bold text-brightBlue" : ""
                        }`}
                        onClick={() => setFilter("All")}
                      >
                        All
                      </span>
                      <span
                        className={`hover:font-bold cursor-pointer ${
                          filter === "Active" ? "font-bold text-brightBlue" : ""
                        }`}
                        onClick={() => setFilter("Active")}
                      >
                        Active
                      </span>
                      <span
                        className={`hover:font-bold cursor-pointer ${
                          filter === "Completed"
                            ? "font-bold text-brightBlue"
                            : ""
                        }`}
                        onClick={() => setFilter("Completed")}
                      >
                        Completed
                      </span>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <p className="flex flex-col md:flex-row justify-center items-center gap-x-3 pt-20 text-darkGrayishBlueLight">
          Challenged by{" "}
          <a href="https://frontendmentor.io/" className="text-brightBlue">
            Frontend Mentor
          </a>{" "}
          & Made by{" "}
          <a href="https://armohanty.com" className="text-brightBlue">
            Anurag Mohanty
          </a>
        </p>
      </div>
    </>
  );
}

export default App;
