'use client'
import { useState, useEffect } from "react";
export default function GameScreen() {
    const [question, setQuestion] = useState<string | null>(null);
    const [answer, setAnswer] = useState<string | null>(null);

    const mockQuestions = [
        {
            question: "What is the capital of France?",
            startingAt: "2025-06-25T15:25:00",
            endingAt: "2025-06-26T15:25:00",
            answers:[
                {
                    user: {
                        username: "Russ"
                    },
                    answer: {
                        user: {
                            username: "Russ"
                        },
                    }
                }
            ]
        },
        {
            question: "What is the capital of Germany?",
            startingAt: "2025-06-25T15:25:00",
            endingAt: "2025-06-26T15:25:00",
        },
        {
            question: "What is the capital of Italy?",
            startingAt: "2025-06-27T15:25:00",
            endingAt: "2025-06-28T15:25:00",
        },
    ]

    const getQuestion = () => {
      const today = new Date().toLocaleDateString()
      const todaysQuestion = mockQuestions.find((question) => new Date(question.startingAt).toLocaleDateString() === today)
      if(todaysQuestion) {
        setQuestion(todaysQuestion.question)
      }
    }
    useEffect(() => {
        getQuestion()
    }, [])
    return (
        <div>
            {question && (
                <div>
                    <h1>{question}</h1>
                    <input type="text" onChange={(e) => setAnswer(e.target.value)} />
                    <button onClick={() => console.log(answer)}>Submit</button>
                </div>
            )}
        </div>
    )
}