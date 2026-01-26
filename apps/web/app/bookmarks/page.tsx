/**
 * Bookmarks Page
 * Display user's bookmarked questions
 * v0.37.1 - Bookmark Question Feature
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bookmark, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';
import useSWR from 'swr';
import { BookmarkButton } from '@/app/components/BookmarkButton';

const fetcher = (url: string) => apiFetch(url).then((res: any) => res.ok ? res.data : null);

export default function BookmarksPage() {
  const { data, error, isLoading, mutate } = useSWR('/api/questions/bookmarks', fetcher);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <Card className="border-red-500">
          <CardContent className="p-6 text-center text-red-500">
            <p>Failed to load bookmarks</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bookmarks = data?.bookmarks || [];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Bookmark className="w-8 h-8" />
          Bookmarked Questions
        </h1>
        <p className="text-gray-400">
          {bookmarks.length} {bookmarks.length === 1 ? 'question' : 'questions'} saved
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bookmark className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">No bookmarks yet</h2>
            <p className="text-gray-400 mb-4">
              Bookmark questions to save them for later review
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((bookmark: any) => (
            <Card key={bookmark.id} className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {bookmark.question.category && (
                      <span className="text-xs text-gray-400 mb-2 block">
                        {bookmark.question.category}
                      </span>
                    )}
                    <CardTitle className="text-lg">{bookmark.question.text}</CardTitle>
                  </div>
                  <BookmarkButton
                    questionId={bookmark.questionId}
                    size="sm"
                    className="ml-4"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-gray-500">
                  Bookmarked {new Date(bookmark.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

