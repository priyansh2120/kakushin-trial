import React, { useState, useEffect } from 'react';

function Quiz({ userId }) {
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [score, setScore] = useState(null);

  useEffect(() => {
    fetch('/api/quiz/questions')
      .then(res => res.json())
      .then(data => setQuestions(data));
  }, []);

  const handleChange = (questionId, selectedAnswer) => {
    setResponses({ ...responses, [questionId]: selectedAnswer });
  };

  const handleSubmit = () => {
    fetch('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ responses, username: userId})
    })
      .then(res => res.json())
      .then(data => setScore(data.score));
  };

  if (score !== null) {
    return <div>Your score is: {score}</div>;
  }

  return (
    <div>
      {questions.map(q => (
        <div key={q._id}>
          <h3>{q.question}</h3>
          {q.options.map(option => (
            <label key={option}>
              <input
                type="radio"
                name={q._id}
                value={option}
                onChange={() => handleChange(q._id, option)}
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
