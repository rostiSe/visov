'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface DailyQuestionProps {
  groupId: string;
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

export default function DailyQuestion({ groupId }: DailyQuestionProps) {
  const [dailyQuestion, setDailyQuestion] = useState<DailyQuestionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [hasAnswered, setHasAnswered] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch today's question
        const questionRes = await fetch(`/api/groups/${groupId}/daily-question`);
        if (questionRes.ok) {
          const data = await questionRes.json();
          setDailyQuestion(data);
          setHasAnswered(data.hasAnswered);
        }

        // Fetch group members
        const membersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/members/${groupId}`);
        if (membersRes.ok) {
          const membersData = await membersRes.json();
          setMembers(membersData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [groupId]);

  const handleSubmit = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/groups/${groupId}/daily-question/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dailyQuestionId: dailyQuestion?.id,
          chosenUserId: selectedUser,
        }),
      });

      if (response.ok) {
        setHasAnswered(true);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  if (isLoading) {
    return <div className="p-4">Lädt...</div>;
  }

  if (!dailyQuestion) {
    return (
      <Card className="m-4">
        <CardHeader>
          <CardTitle>Keine Frage für heute</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Es gibt heute keine aktive Frage für diese Gruppe.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="m-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Tägliche Frage</CardTitle>
            <p className="text-sm text-gray-500">
              {format(new Date(dailyQuestion.date), 'EEEE, d. MMMM yyyy', { locale: de })}
            </p>
          </div>
          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
            {dailyQuestion.question.package.name}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-lg font-medium">{dailyQuestion.question.text}</p>
          
          {!hasAnswered ? (
            <>
              <div className="space-y-2">
                <p className="text-sm font-medium">Wähle einen Benutzer:</p>
                <div className="grid grid-cols-2 gap-2">
                  {members
                    .filter(member => member.id !== 'current-user-id') // Replace with actual current user ID
                    .map((member) => (
                      <Button
                        key={member.id}
                        variant={selectedUser === member.id ? 'default' : 'outline'}
                        className="justify-start"
                        onClick={() => setSelectedUser(member.id)}
                      >
                        {member.username}
                      </Button>
                    ))}
                </div>
              </div>
              <Button 
                className="w-full mt-4" 
                disabled={!selectedUser}
                onClick={handleSubmit}
              >
                Antwort absenden
              </Button>
            </>
          ) : (
            <p className="text-green-600">Du hast bereits geantwortet!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
