import React, { useEffect, useState } from "react";
import axios from "axios";
import Button from "../components/Button";
import Feedback from "../components/Feedback";
import "./Quiz.css";

interface IQuizReponse {
  response_code: number;
  results: {
    category: string;
    type: string;
    difficulty: string;
    question: string;
    correct_answer: string;
    incorrect_answers: string[];
  }[];
}

type PropTypes = {
  difficulty: string;
  category: string;
};

const Quiz = (props: PropTypes) => {
  const [getQuestions, setQuestions] = useState<
    IQuizReponse["results"] | undefined
  >([]);
  const [step, setStep] = useState(1);
  const [points, setPoints] = useState(0);
  const [timer, setTimer] = useState(15);
  const [isJokerUsed, setIsJokerUsed] = useState({ step: 0, used: false });

  // Poor man's react router
  const [whatPageToShow, setWhatPageToShow] = useState<
    "question" | "wrong" | "success" | "timeout"
  >("question");

  // To not start countdown before async request finishes
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const questions = await axios.get<IQuizReponse>(
        `https://opentdb.com/api.php?amount=10&category=${props.category}&difficulty=${props.difficulty}&type=multiple`
      );
      setQuestions(questions.data.results);
      setLoading(false);
    })();
  }, [props.category, props.difficulty]);

  useEffect(() => {
    if (timer > 0 && !loading && whatPageToShow === "question") {
      var countDown = setTimeout(() => {
        setTimer(timer - 1);
      }, 1000);
    } else if (timer === 0 && !loading) {
      setWhatPageToShow("timeout");
    }
    return () => clearTimeout(countDown);
  }, [timer, loading, whatPageToShow]);

  let renderElement = () => {
    if (whatPageToShow === "question") {
      return questionEl();
    } else {
      return (
        <Feedback
          points={points}
          page={whatPageToShow}
          gameOver={step === 10}
          earnedPoints={timer * 10}
          onClick={switchToQuestionPage}
        />
      );
    }
  };

  const switchToQuestionPage = () => {
    setTimer(15);
    setStep(step + 1);
    setWhatPageToShow("question");
  };

  const handleJoker = () => {
    setIsJokerUsed({ step, used: true });
  };

  const handleCorrectAnswer = () => {
    setWhatPageToShow("success");
    setPoints(points + timer * 10);
  };
  const handleWrongAnswer = () => {
    setWhatPageToShow("wrong");
  };

  let questionEl = () => {
    if (getQuestions && getQuestions?.length > 0) {
      let question = getQuestions[step - 1];
      let choicesArray = [
        ...question.incorrect_answers,
        question.correct_answer
      ].sort(); // Sorting is done so correct answer doesnt always appear in the same order.
      let choicesEl = choicesArray.map((answer, index) => (
        <Button
          key={index}
          onClick={
            answer === question.correct_answer
              ? handleCorrectAnswer
              : handleWrongAnswer
          }
          text={`${answer}`}
        />
      ));

      const jokerFn = () => {
        // Disable first two incorrect answers
        let jokerEl = question.incorrect_answers.map((answer, index) => {
          if (index < 2) {
            return <Button key={index} disabled text={`${answer}`} />;
          } else {
            return (
              <Button
                key={index}
                onClick={handleWrongAnswer}
                text={`${answer}`}
              />
            );
          }
        });
        //push correct answer into array
        jokerEl.push(
          <Button
            key={question.correct_answer}
            onClick={handleCorrectAnswer}
            text={`${question.correct_answer}`}
          />
        );

        // Sort JSX Nodes so order doesn't change when joker is used
        jokerEl.sort((a, b) => {
          if (a.props.text < b.props.text) return -1;
          if (a.props.text > b.props.text) return 1;
          else return 0;
        });
        return jokerEl;
      };

      return (
        <div className="question-container">
          <div className="question">{question.question}</div>
          <div className="choices">
            {isJokerUsed.used && step === isJokerUsed.step
              ? jokerFn()
              : choicesEl}
          </div>
        </div>
      );
    }
  };
  return (
    <>
      <div className="quiz-container">
        <div className="topbar">
          <div>Question {step}/10</div>
          <div>{points} Points</div>
          {whatPageToShow === "question" ? (
            <div>Remaining Time: {timer}</div>
          ) : null}
        </div>
        {renderElement() ?? "loading..."}
      </div>
      {whatPageToShow === "question" && !isJokerUsed.used && !loading ? (
        <div>
          <Button onClick={handleJoker} text="Use Joker"></Button>
        </div>
      ) : null}
    </>
  );
};

export default Quiz;
