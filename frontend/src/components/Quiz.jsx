import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from "../contexts/UserContext";


const Quiz=()=> {
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const { user } = useContext(UserContext);

  useEffect(() => {
    fetch('http://localhost:5000/api/quiz/questions')
      .then(response => response.json())
      .then(data => {
        setQuestions(data[0].questions);
      })
      .catch(error => {
        console.error('There was an error fetching the questions!', error);
      });
  }, []);

  const handleOptionChange = (questionIndex, option) => {
    setUserAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionIndex]: option,
    }));
  };

  const handleSubmit = () => {
    // Map through the questions to create a results array
    const results = questions.map((question, index) => ({
      question: question.question,
      correctAnswer: question.correctAnswer,
      userAnswer: userAnswers[index] || '',
      isCorrect: question.correctAnswer === (userAnswers[index] || ''),
    }));
  
    // Calculate the score based on the number of correct answers
    const score = results.reduce((acc, result) => acc + (result.isCorrect ? 1 : 0), 0);
  
    // Submit the results and score to the server
    fetch('http://localhost:5000/api/quiz/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ results, score, userId: user._id}),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Results submitted successfully:', data);
        // You can handle the response data as needed
      })
      .catch(error => {
        console.error('There was an error submitting the results!', error);
      });
  };
  

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Quiz</h1>
      {questions.map((question, index) => (
        <div key={index} className="mb-4">
          <h2 className="text-xl">{question.question}</h2>
          {question.options.map((option, idx) => (
            <div key={idx}>
              <label>
                <input
                  type="radio"
                  name={`question-${index}`}
                  value={option}
                  onChange={() => handleOptionChange(index, option)}
                />
                {option}
              </label>
            </div>
          ))}
        </div>
      ))}
      <button
        className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );
}

export default Quiz;