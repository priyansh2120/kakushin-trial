import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from "../contexts/UserContext";
import Modal from 'react-modal';

// Set the app element for accessibility purposes
Modal.setAppElement('#root');

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [results, setResults] = useState(null);
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
    const results = questions.map((question, index) => ({
      question: question.question,
      correctAnswer: question.correctAnswer,
      userAnswer: userAnswers[index] || '',
      isCorrect: question.correctAnswer === (userAnswers[index] || ''),
    }));

    const score = results.reduce((acc, result) => acc + (result.isCorrect ? 1 : 0), 0);

    setResults({ score, results });

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

  const closeModal = () => {
    setResults(null);
  };

  return (
    <div className="container mx-auto p-4 bg-gray-100 text-black min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Quiz</h1>
      {questions.map((question, index) => (
        <div key={index} className="mb-6">
          <h2 className="text-xl mb-2">{question.question}</h2>
          <div className="grid grid-cols-2 gap-4">
            {question.options.map((option, idx) => {
              const isSelected = userAnswers[index] === option;
              const optionBg = isSelected ? 'bg-blue-300' : 'bg-gray-200';
              const optionText = isSelected ? 'text-white' : 'text-black';

              return (
                <div key={idx} className={`p-4 rounded ${optionBg} ${optionText}`}>
                  <label className="cursor-pointer flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      onChange={() => handleOptionChange(index, option)}
                      className="mr-2"
                      checked={isSelected}
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
      {results && (
        <Modal
          isOpen={!!results}
          onRequestClose={closeModal}
          contentLabel="Results Modal"
          className="bg-white p-8 rounded shadow-lg mx-auto my-4 max-w-2xl"
          overlayClassName="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center"
        >
          <h2 className="text-2xl font-bold">Your Score: {results.score} / {questions.length}</h2>
          <ul className="mt-4">
            {results.results.map((result, index) => (
              <li key={index} className="mb-2">
                <p className="text-lg">{result.question}</p>
                <p className={`text-sm ${result.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                  Your answer: {result.userAnswer} (Correct answer: {result.correctAnswer})
                </p>
              </li>
            ))}
          </ul>
          <button
            className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
            onClick={closeModal}
          >
            Close
          </button>
        </Modal>
      )}
    </div>
  );
};

export default Quiz;
