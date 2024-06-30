import React, { useState, useEffect } from "react";

function Quiz({ userId }) {
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [score, setScore] = useState(null);

  useEffect(() => {
    console.log("Fetching questions...");
    fetch("http://localhost:5000/api/quiz/questions")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched questions:", data);
        if (data.length > 0) {
          setQuestions(data[0].questions);
        }
      })
      .catch((error) => console.error("Error fetching questions:", error));
  }, []);
  

  const handleChange = (questionIndex, selectedAnswer) => {
    setResponses({ ...responses, [questionIndex]: selectedAnswer });
  };

  const handleSubmit = () => {
    fetch("http://localhost:5000/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ responses, username: userId }),
    })
      .then((res) => res.json())
      .then((data) => setScore(data.score))
      .catch((error) => console.error("Error submitting quiz:", error));
  };

  if (score !== null) {
    return <div>Your score is: {score}</div>;
  }

  return (
    <div>
      {questions.map((q, index) => (
        <div key={index}>
          <h3>{q.question}</h3>
          {q.options.map((option) => (
            <label key={option}>
              <input
                type="radio"
                name={`question-${index}`}
                value={option}
                onChange={() => handleChange(index, option)}
              />
              {option}
            </label>
          ))}
        </div>
      ))}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default Quiz;
