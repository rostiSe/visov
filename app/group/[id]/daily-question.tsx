"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import AnswerResults from './answer-results';

interface Member {
  id: string;
  username: string;
  profilePicture?: string | null;
}

interface GlobalQuestion {
  id: string;
  text: string;
}

interface PackageQuestion {
  id: string;
  text: string;
  packageId: string;
}

interface DailyQuestionsResponse {
  groupId: string;
  date: string;
  global: GlobalQuestion | null;
  package: PackageQuestion[];
}

interface Props {
  groupId: string;
  members: Member[];
}

export default function DailyQuestion({ groupId, members }: Props) {
  const [data, setData] = useState<DailyQuestionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // State for answer results
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [results, setResults] = useState<{ member: Member; count: number }[]>([]);
  const [userChoice, setUserChoice] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDailyAndStatus() {
      try {
        // Fetch today's questions
        const res = await fetch(`/api/groups/${groupId}/daily-questions`, { cache: 'no-store' });
        if (!res.ok) {
          console.error('Fetch question error', await res.text());
          return;
        }
        const json: DailyQuestionsResponse = await res.json();
        setData(json);

        // Fetch answer status & results
        const statusRes = await fetch(`/api/groups/${groupId}/daily-questions/answer`, { cache: 'no-store' });
        if (statusRes.ok) {
          const statusJson: { hasAnswered: boolean; userChoice: string; results: { member: Member; count: number }[] } = await statusRes.json();
          setHasAnswered(statusJson.hasAnswered);
          setUserChoice(statusJson.userChoice);
          setResults(statusJson.results);
        } else {
          setHasAnswered(false);
        }
      } catch (err) {
        console.error('Error loading daily or answer status', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDailyAndStatus();
  }, [groupId]);

  const handleSubmit = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/daily-questions/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chosenUserId: selectedUser }),
      });
      if (res.ok) {
        const ansJson: { hasAnswered: boolean; userChoice: string; results: { member: Member; count: number }[] } = await res.json();
        setHasAnswered(ansJson.hasAnswered);
        setUserChoice(ansJson.userChoice);
        setResults(ansJson.results);
      } else {
        console.error('Submit error', await res.text());
      }
    } catch (err) {
      console.error('Submission error', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        <div className="h-20 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  // If answered, show results
  if (hasAnswered) {
    return <AnswerResults results={results} userChoice={userChoice!} />;
  }

  if (!data || (!data.global && data.package.length === 0)) {
    return (
      <Card className="m-4 p-4 text-center">
        <p className="text-gray-500">Keine Frage für heute</p>
      </Card>
    );
  }

  return (
    <div className="m-4 space-y-6">
      {/* Global Question */}
      {data.global && (
        <Card>
          <CardContent>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-serif text-amber-800">
                {data.global.text}
              </CardTitle>
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                Tägliche
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Package Questions */}
      {data.package.map((q) => (
        <Card key={q.id}>
          <CardContent>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-serif">
                {q.text}
              </CardTitle>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Paket: {q.packageId}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Member Selection */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          {members.map((m) => (
            <Button
              key={m.id}
              variant="ghost"
              className={cn(
                'flex items-center gap-2',
                selectedUser === m.id && 'bg-amber-100'
              )}
              onClick={() => setSelectedUser(m.id)}
            >
              <Image
                src={m.profilePicture || '/hero.jpg'}
                alt={m.username}
                width={32}
                height={32}
                className="rounded-full"
              />
              <span>@{m.username}</span>
            </Button>
          ))}
        </div>
        <Button
          className="mt-4 w-full"
          disabled={!selectedUser || submitting}
          onClick={handleSubmit}
        >
          {submitting ? 'Wird gespeichert...' : 'Auswählen'}
        </Button>
      </Card>
    </div>
  );
}
