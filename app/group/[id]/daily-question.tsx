"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface QuestionAnswerState {
  questionId: string;
  selectedUser: string | null;
  hasAnswered: boolean;
  results: { member: Member; count: number }[];
  userChoice: string | null;
}

export default function DailyQuestion({ groupId, members }: Props) {
  const [data, setData] = useState<DailyQuestionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('global');
  
  // State for each question's answer state
  const [answerStates, setAnswerStates] = useState<Record<string, QuestionAnswerState>>({});
  const [submitting, setSubmitting] = useState(false);

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

        // Initialize answer states for each question
        const states: Record<string, QuestionAnswerState> = {};
        
        if (json.global) {
          states['global'] = {
            questionId: json.global.id,
            selectedUser: null,
            hasAnswered: false,
            results: [],
            userChoice: null
          };
        }

        json.package.forEach((pkg, index) => {
          states[`pkg-${index}`] = {
            questionId: pkg.id,
            selectedUser: null,
            hasAnswered: false,
            results: [],
            userChoice: null
          };
        });

        // Fetch answer status for each question
        const answerPromises = Object.entries(states).map(async ([key, state]) => {
          const statusRes = await fetch(
            `/api/groups/${groupId}/daily-questions/${state.questionId}/answer`, 
            { cache: 'no-store' }
          );
          
          if (statusRes.ok) {
            const statusJson = await statusRes.json();
            states[key] = {
              ...state,
              hasAnswered: statusJson.hasAnswered,
              userChoice: statusJson.userChoice,
              results: statusJson.results || []
            };
          }
        });

        await Promise.all(answerPromises);
        setAnswerStates(states);

        // Set first tab with questions as active
        if (json.global) {
          setActiveTab('global');
        } else if (json.package.length > 0) {
          setActiveTab('pkg-0');
        }
      } catch (err) {
        console.error('Error loading daily or answer status', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDailyAndStatus();
  }, [groupId]);

  const handleSubmit = async (questionId: string) => {
    const state = answerStates[activeTab];
    if (!state || !state.selectedUser) return;
    
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/groups/${groupId}/daily-questions/${questionId}/answer`, 
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chosenUserId: state.selectedUser }),
        }
      );
      
      if (res.ok) {
        const ansJson = await res.json();
        setAnswerStates(prev => ({
          ...prev,
          [activeTab]: {
            ...prev[activeTab],
            hasAnswered: ansJson.hasAnswered,
            userChoice: ansJson.userChoice,
            results: ansJson.results || []
          }
        }));
      } else {
        console.error('Submit error', await res.text());
      }
    } catch (err) {
      console.error('Submission error', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUserSelect = (userId: string) => {
    setAnswerStates(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        selectedUser: userId
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        <div className="h-20 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!data || (!data.global && data.package.length === 0)) {
    return (
      <Card className="m-4 p-4 text-center">
        <p className="text-gray-500">Keine Fragen für heute</p>
      </Card>
    );
  }

  // If no active tab is set but we have questions, set the first available tab
  if (!activeTab && (data.global || data.package.length > 0)) {
    const firstTab = data.global ? 'global' : `pkg-0`;
    setActiveTab(firstTab);
    return null; // Will re-render with the correct tab
  }

  // Find the current question based on active tab
  const currentState = activeTab ? answerStates[activeTab] : null;
  const currentQuestion = activeTab === 'global' 
    ? data.global 
    : data.package[parseInt(activeTab.replace('pkg-', ''))];

  // If answered, show results for current tab
  if (currentState?.hasAnswered) {
    return (
      <div className="m-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid w-full grid-cols-2">
            {data.global && (
              <TabsTrigger value="global">Tägliche Frage</TabsTrigger>
            )}
            {data.package.map((_, index) => (
              <TabsTrigger key={`pkg-${index}`} value={`pkg-${index}`}>
                Paket {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="mt-4">
          <AnswerResults 
            results={currentState.results} 
            userChoice={currentState.userChoice!} 
            questionText={currentQuestion?.text || ''}
            packageName={activeTab !== 'global' ? `Paket ${activeTab.replace('pkg-', '')}` : undefined}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="m-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="grid w-full grid-cols-2">
          {data.global && (
            <TabsTrigger value="global">Tägliche Frage</TabsTrigger>
          )}
          {data.package.map((_, index) => (
            <TabsTrigger key={`pkg-${index}`} value={`pkg-${index}`}>
              Paket {index + 1}
            </TabsTrigger>
          ))}
        </TabsList>

        {data.global && (
          <TabsContent value="global">
            <QuestionCard 
              question={data.global.text}
              type="global"
              members={members}
              selectedUser={answerStates.global?.selectedUser || null}
              onUserSelect={handleUserSelect}
              onSubmit={() => handleSubmit(data.global!.id)}
              submitting={submitting}
            />
          </TabsContent>
        )}

        {data.package.map((q, index) => (
          <TabsContent key={`pkg-${index}`} value={`pkg-${index}`}>
            <QuestionCard 
              question={q.text}
              type="package"
              packageName={`Paket ${index + 1}`}
              members={members}
              selectedUser={answerStates[`pkg-${index}`]?.selectedUser || null}
              onUserSelect={handleUserSelect}
              onSubmit={() => handleSubmit(q.id)}
              submitting={submitting}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface QuestionCardProps {
  question: string;
  type: 'global' | 'package';
  packageName?: string;
  members: Member[];
  selectedUser: string | null;
  onUserSelect: (userId: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}

function QuestionCard({ 
  question, 
  type, 
  packageName, 
  members, 
  selectedUser, 
  onUserSelect,
  onSubmit,
  submitting 
}: QuestionCardProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-serif">
              {question}
            </CardTitle>
            <span className={cn(
              "text-xs px-2 py-1 rounded",
              type === 'global' 
                ? 'bg-amber-100 text-amber-800'
                : 'bg-blue-100 text-blue-800'
            )}>
              {type === 'global' ? 'Tägliche' : packageName}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-medium mb-3">Wähle einen Benutzer:</h3>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => (
            <Button
              key={m.id}
              variant="ghost"
              className={cn(
                'flex items-center gap-2',
                selectedUser === m.id && 'bg-amber-100'
              )}
              onClick={() => onUserSelect(m.id)}
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
          onClick={onSubmit}
        >
          {submitting ? 'Wird gespeichert...' : 'Antwort abschicken'}
        </Button>
      </Card>
    </div>
  );
}
