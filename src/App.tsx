import React, { useState, useEffect, useRef } from "react";
import logo from "./logo.svg";
import "./App.css";
import Button from "./components/Button";
import Quiz from "./containers/Quiz";
import Axios from "axios";

type CategoriesState = {
  id: number;
  name: string;
}[];

const App: React.FC = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [categories, setCategories] = useState<CategoriesState>([]);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const difficultyRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    (async () => {
      const categories = await Axios.get(
        "https://opentdb.com/api_category.php"
      );
      setCategories([
        { id: "", name: "Any" },
        ...categories.data.trivia_categories
      ]);
    })();
  }, []);

  const jsxCategories = categories.map(el => (
    <option key={el.id} value={el.id}>
      {el.name}
    </option>
  ));

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>A TRIVIA GAME</p>
        {showQuiz ? (
          <Quiz
            category={categoryRef.current!.value}
            difficulty={difficultyRef.current!.value}
          />
        ) : (
          <div className="app-container">
            <label htmlFor="difficulty">Choose a difficulty</label>
            <select className="select-css" id="difficulty" ref={difficultyRef}>
              <option value="">Any</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <label htmlFor="category">Choose a category</label>
            {categories[0] ? (
              <select id="category" ref={categoryRef}>
                {jsxCategories}
              </select>
            ) : (
              "Loading..."
            )}

            {categories[0] ? (
              <Button onClick={() => setShowQuiz(true)} text="Start Quiz" />
            ) : null}
          </div>
        )}
      </header>
    </div>
  );
};

export default App;
