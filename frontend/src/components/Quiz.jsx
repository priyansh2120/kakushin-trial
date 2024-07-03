import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from "../contexts/UserContext";

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
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
    setShowResults(true);

    const results = questions.map((question, index) => ({
      question: question.question,
      correctAnswer: question.correctAnswer,
      userAnswer: userAnswers[index] || '',
      isCorrect: question.correctAnswer === (userAnswers[index] || ''),
    }));

    const score = results.reduce((acc, result) => acc + (result.isCorrect ? 1 : 0), 0);

    fetch('http://localhost:5000/api/quiz/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ results, score, userId: user._id }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Results submitted successfully:', data);
      })
      .catch(error => {
        console.error('There was an error submitting the results!', error);
      });
  };

  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Quiz</h1>
      {questions.map((question, index) => (
        <div key={index} className="mb-8">
          <h2 className="text-xl mb-4">{question.question}</h2>
          <div className="grid grid-cols-2 gap-4">
            {question.options.map((option, idx) => {
              const isSelected = userAnswers[index] === option;
              const isCorrect = question.correctAnswer === option;
              const isIncorrect = isSelected && !isCorrect;
              const isUnanswered = !userAnswers[index] && !showResults;

              let bgColor = 'bg-white';
              if (showResults) {
                bgColor = isCorrect ? 'bg-green-300' : isIncorrect ? 'bg-red-300' : isSelected ? 'bg-yellow-300' : 'bg-gray-200';
              }

              return (
                <div
                  key={idx}
                  className={`p-4 border rounded cursor-pointer ${bgColor}`}
                  onClick={() => handleOptionChange(index, option)}
                >
                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      checked={userAnswers[index] === option}
                      onChange={() => handleOptionChange(index, option)}
                      className="hidden"
                    />
                    {option}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <button
        className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
        onClick={handleSubmit}
      >
        Submit
      </button>
      {showResults && (
        <div className="mt-8">
          <h2 className="text-xl font-bold">Your Score: {questions.filter((q, index) => q.correctAnswer === userAnswers[index]).length} / {questions.length}</h2>
        </div>
      )}
    </div>
  );
}

export default Quiz;
