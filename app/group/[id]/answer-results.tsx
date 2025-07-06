"use client";

import { FC } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';

interface Profile {
  id: string;
  username: string;
  profilePicture?: string | null;
}

interface Result {
  member: Profile;
  count: number;
}

interface AnswerResultsProps {
  results: Result[];
  userChoice: string;
  questionText: string;
  packageName?: string;
}

const AnswerResults: FC<AnswerResultsProps> = ({ 
  results, 
  userChoice, 
  questionText, 
  packageName 
}) => {
  if (!results || results.length === 0) {
    return (
      <Card className="m-4 p-4 text-center">
        <p className="text-gray-500">Noch keine Antworten</p>
      </Card>
    );
  }

  const totalVotes = results.reduce((sum, { count }) => sum + count, 0);
  const maxVotes = Math.max(...results.map(r => r.count), 0);

  return (
    <div className="space-y-4 m-4">
      <div className="space-y-3 mb-6">
        {packageName && (
          <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            {packageName}
          </span>
        )}
        <h2 className="text-xl font-serif text-gray-900">{questionText}</h2>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Teilnehmer</span>
          <span>Stimmen</span>
        </div>
        
        <div className="space-y-3">
          {results.map(({ member, count }) => {
            const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
            const isUserChoice = userChoice === member.id;
            
            return (
              <div key={member.id} className="relative group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Image
                        src={member.profilePicture || '/hero.jpg'}
                        alt={member.username}
                        width={40}
                        height={40}
                        className={`rounded-full border-2 ${isUserChoice ? 'border-amber-500' : 'border-transparent'}`}
                      />
                      {isUserChoice && (
                        <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <span className={`font-medium ${isUserChoice ? 'text-amber-600' : 'text-gray-800'}`}>
                      {member.username}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
                
                <div className="h-4.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${isUserChoice ? 'bg-amber-500' : 'bg-gray-400'}`}
                    style={{ 
                      width: `${percentage}%`,
                      transition: 'width 0.5s ease-in-out'
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-end pr-2">
                      {percentage > 20 && (
                        <span className="text-xs font-medium text-white">
                          {Math.round(percentage)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {percentage <= 20 && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500">
                    {Math.round(percentage)}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="pt-2 text-right text-xs text-gray-500">
          {totalVotes} {totalVotes === 1 ? 'Stimme' : 'Stimmen'} insgesamt
        </div>
      </div>
    </div>
  );
};

export default AnswerResults;
