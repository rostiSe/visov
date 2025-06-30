"use client";

import { FC } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

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
  userChoice?: string;
}

const AnswerResults: FC<AnswerResultsProps> = ({ results, userChoice }) => {
  if (!results || results.length === 0) {
    return (
      <Card className="m-4 p-4 text-center">
        <p className="text-gray-500">Noch keine Antworten</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4 m-4">
      {results.map(({ member, count }) => (
        <Card key={member.id} className="flex items-center p-4">
          <Image
            src={member.profilePicture || '/hero.jpg'}
            alt={member.username}
            width={48}
            height={48}
            className="rounded-full"
          />
          <div className="ml-4 flex-1">
            <CardTitle className="text-lg font-medium">@{member.username}</CardTitle>
            <p className="text-sm text-gray-600">{count} {count === 1 ? 'Stimme' : 'Stimmen'}</p>
          </div>
          {userChoice === member.id && (
            <span className="text-amber-600 font-semibold">Ihre Wahl</span>
          )}
        </Card>
      ))}
    </div>
  );
};

export default AnswerResults;
