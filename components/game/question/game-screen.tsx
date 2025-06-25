'use client'
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Member } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState, useEffect } from "react";
export default function GameScreen({members}: {members: Member[]}) {
    const [question, setQuestion] = useState<string | null>(null);
    const [answer, setAnswer] = useState<string | null>(null);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null)
    const [loading, setLoading] = useState(false)

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
            question: "Wer würde eher seine/n Partner/in Mommy/Daddy nennen?",
            startingAt: "2025-06-26T15:25:00",
            endingAt: "2025-06-27T15:25:00",
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
                <Card className="mx-2 py-5 px-2">
                    <CardTitle className="font-serif text-amber-800 text-xl font-medium">{question}</CardTitle>
                    <div className="flex flex-col ">
                        {members.map((member) => (
                            <Button key={member.id} onClick={() => setSelectedMember(member)} variant={"ghost"} className={cn("flex h-full items-center justify-start gap-2", selectedMember?.id === member.id && "bg-amber-100 hover:bg-amber-100")}>
                            <div key={member.id} className="flex items-center gap-2">
                                <Image
                                    src={member.profilePicture || "/hero.jpg"}
                                    alt="profile"
                                    width={100}
                                    height={100}
                                    className="rounded-full w-[3rem] h-[3rem] object-cover"
                                />
                                <p className="font-light">@{member.username}</p>
                            </div>
                            
                            </Button>
                        ))}
                    </div>
                    <Button disabled={loading || !selectedMember} className="bg-amber-100" variant={"outline"} onClick={() => setLoading(true)}>Auswählen</Button>
                </Card>
            )}
        </div>
    )
}