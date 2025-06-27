'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface Member {
  id: string;
  username: string;
  profilePicture?: string | null;
}

interface DailyQuestionProps {
  groupId: string;
  members: Member[];
}

interface DailyQuestionData {
  id: string;
  question: {
    id: string;
    text: string;
    package: {
      name: string;
    };
  };
  date: string;
  isActive: boolean;
}

export default function DailyQuestion({ groupId, members }: DailyQuestionProps) {
  const [dailyQuestion, setDailyQuestion] = useState<DailyQuestionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const questionRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/${groupId}/daily-question`, {
          next: {
            revalidate: 3600,
          },
        });
        if (questionRes.ok) {
          const data = await questionRes.json();
          setDailyQuestion(data);
        }
      } catch (error) {
        console.error('Error fetching question:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestion();
  }, [groupId]);

  const handleSubmit = async () => {
    if (!selectedUser || !dailyQuestion?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/${groupId}/daily-question/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dailyQuestionId: dailyQuestion.id,
          chosenUserId: selectedUser,
        }),
        credentials: 'include',
      });

      const data = await response.json();
      if (response.ok) {
        // Update the UI to show the answer was submitted
        setLoading(false);
        return data;
      } else {
        console.error('Server error:', data);
        throw new Error(data.error || 'Failed to submit answer');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      // Log the full error response if available
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
      }
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-2 py-5 px-2">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!dailyQuestion) {
    return (
      <div className="mx-2 py-5 px-2">
        <Card className="p-4 text-center">
          <p className="text-gray-500">Keine Frage für heute</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-1 py-5 ">
      <Card className="p-4 border-none">
        <div className="flex justify-between items-start mb-4">
          <CardTitle className="font-serif text-amber-800 text-2xl pt-2 font-medium">
            {dailyQuestion.question.text}
          </CardTitle>
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-md">
            {dailyQuestion.question.package?.name || 'Tägliche Frage'}
          </span>
        </div>
        
        <div className="flex flex-col space-y-2">
          {members
            .filter(member => member.id !== 'current-user-id')
            .map((member) => (
              <Button 
                key={member.id} 
                onClick={() => setSelectedUser(member.id)} 
                variant="ghost" 
                className={cn(
                  "flex h-full items-center justify-start gap-2", 
                  selectedUser === member.id && "bg-amber-100 hover:bg-amber-100"
                )}
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={member.profilePicture || "/hero.jpg"}
                    alt={member.username}
                    width={40}
                    height={40}
                    className="rounded-full w-10 h-10 object-cover"
                  />
                  <p className="font-light">@{member.username}</p>
                </div>
              </Button>
            ))}
        </div>
        
        <Button 
          disabled={!selectedUser || loading}
          className="mt-4 w-full bg-amber-100 hover:bg-amber-200"
          variant="outline"
          onClick={handleSubmit}
        >
          {loading ? 'Wird gespeichert...' : 'Auswählen'}
        </Button>
      </Card>
    </div>
  );
}
