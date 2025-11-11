'use client';

/**
 * Flow Demo Page
 * v0.35.13a - Added MULTIPLE_CHOICE support (checkboxes)
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle2, XCircle, ArrowRight, SkipForward } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface FlowCategory {
  id: string;
  name: string;
  questionCount: number;
}

interface FlowQuestion {
  id: string;
  text: string;
  type: string;
  difficulty: string;
  categoryName: string;
  options?: Array<{
    id: string;
    label: string;
    value: string;
    order: number;
  }>;
}

export default function FlowDemoPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // State
  const [step, setStep] = useState<'category' | 'question' | 'result'>('category');
  const [categories, setCategories] = useState<FlowCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState<FlowQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]); // For multiple choice
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [numericAnswer, setNumericAnswer] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [totalXp, setTotalXp] = useState(0);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const res = await fetch('/api/flow/categories');
      const data = await res.json();
      
      if (data.success && data.data) {
        setCategories(data.data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load categories',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load categories',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }

  async function startFlow() {
    if (!selectedCategory) return;
    
    setLoading(true);
    try {
      // Start flow
      const startRes = await fetch('/api/flow/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: selectedCategory })
      });
      
      if (!startRes.ok) {
        throw new Error('Failed to start flow');
      }
      
      // Load first question
      await loadNextQuestion();
      setStep('question');
    } catch (error) {
      console.error('Error starting flow:', error);
      toast({
        title: 'Error',
        description: 'Failed to start flow',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadNextQuestion() {
    setLoading(true);
    try {
      const res = await fetch(`/api/flow/question?categoryId=${selectedCategory}`);
      const data = await res.json();
      
      if (data.success && data.data) {
        if (data.data.completed) {
          // No more questions
          setStep('result');
          await loadResults();
        } else {
          setCurrentQuestion(data.data);
          setSelectedAnswer('');
          setSelectedAnswers([]);
          setTextAnswer('');
          setNumericAnswer(null);
        }
      }
    } catch (error) {
      console.error('Error loading question:', error);
      toast({
        title: 'Error',
        description: 'Failed to load question',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }

  function toggleMultipleChoice(optionId: string) {
    setSelectedAnswers(prev => {
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId);
      } else {
        return [...prev, optionId];
      }
    });
  }

  async function submitAnswer() {
    if (!currentQuestion) return;
    
    setLoading(true);
    try {
      const payload: any = {
        questionId: currentQuestion.id
      };
      
      // Add answer based on question type
      if (currentQuestion.type === 'SINGLE_CHOICE' && selectedAnswer) {
        payload.optionIds = [selectedAnswer];
      } else if (currentQuestion.type === 'MULTIPLE_CHOICE') {
        payload.optionIds = selectedAnswers;
      } else if (currentQuestion.type === 'TEXT') {
        payload.textValue = textAnswer;
      } else if (currentQuestion.type === 'NUMERIC') {
        payload.numericValue = numericAnswer;
      }
      
      const res = await fetch('/api/flow/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setAnsweredCount(prev => prev + 1);
        setTotalXp(prev => prev + 10);
        toast({
          title: 'Answer recorded!',
          description: '+10 XP',
        });
        await loadNextQuestion();
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit answer',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }

  async function skipCurrentQuestion() {
    if (!currentQuestion) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/flow/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          questionId: currentQuestion.id,
          skipped: true
        })
      });
      
      if (res.ok) {
        setSkippedCount(prev => prev + 1);
        toast({
          title: 'Question skipped'
        });
        await loadNextQuestion();
      }
    } catch (error) {
      console.error('Error skipping question:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadResults() {
    try {
      const res = await fetch(`/api/flow/result?categoryId=${selectedCategory}`);
      const data = await res.json();
      
      if (data.success && data.data) {
        setAnsweredCount(data.data.questionsAnswered);
        setSkippedCount(data.data.questionsSkipped);
        setTotalXp(data.data.xpGained);
      }
    } catch (error) {
      console.error('Error loading results:', error);
    }
  }

  // Render category selection
  if (step === 'category') {
    return (
      <div className="min-h-screen bg-bg p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-text mb-6">Start Flow</h1>
          
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : categories.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-subtle">No categories available. Please seed the database first.</p>
                <Button onClick={() => router.push('/admin/seeds')} className="mt-4">
                  Go to Admin Seeds
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {categories.map(cat => (
                <Card
                  key={cat.id}
                  className={`cursor-pointer transition-colors ${selectedCategory === cat.id ? 'border-accent bg-accent/5' : 'hover:border-accent/50'}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{cat.name}</span>
                      <span className="text-sm text-subtle">{cat.questionCount} questions</span>
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
              
              <Button
                onClick={startFlow}
                disabled={!selectedCategory || loading}
                className="w-full bg-accent text-white hover:bg-accent/90"
              >
                Start Flow <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render question
  if (step === 'question' && currentQuestion) {
    const canSubmit = 
      (currentQuestion.type === 'SINGLE_CHOICE' && selectedAnswer) ||
      (currentQuestion.type === 'MULTIPLE_CHOICE' && selectedAnswers.length > 0) ||
      (currentQuestion.type === 'TEXT' && textAnswer.length > 0) ||
      (currentQuestion.type === 'NUMERIC' && numericAnswer !== null);
    
    return (
      <div className="min-h-screen bg-bg p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-subtle">
              Answered: {answeredCount} | Skipped: {skippedCount} | XP: {totalXp}
            </span>
            <span className="text-sm text-subtle">{currentQuestion.categoryName}</span>
          </div>
          
          <Card>
            <CardHeader>
              <div className="space-y-2">
                <CardTitle className="text-2xl">{currentQuestion.text}</CardTitle>
                {currentQuestion.type === 'MULTIPLE_CHOICE' && (
                  <p className="text-sm text-subtle">Select all that apply</p>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* SINGLE CHOICE - Radio Buttons */}
              {currentQuestion.type === 'SINGLE_CHOICE' && currentQuestion.options && (
                <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                  {currentQuestion.options.map(option => (
                    <div key={option.id} className="flex items-center space-x-2 p-3 border border-border rounded hover:bg-card/50">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              
              {/* MULTIPLE CHOICE - Checkboxes */}
              {currentQuestion.type === 'MULTIPLE_CHOICE' && currentQuestion.options && (
                <div className="space-y-2">
                  {currentQuestion.options.map(option => (
                    <div 
                      key={option.id} 
                      className={`flex items-center space-x-3 p-3 border rounded cursor-pointer transition-colors `}
                      onClick={() => toggleMultipleChoice(option.id)}
                    >
                      <Checkbox 
                        id={option.id}
                        checked={selectedAnswers.includes(option.id)}
                        onCheckedChange={() => toggleMultipleChoice(option.id)}
                      />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                  {selectedAnswers.length > 0 && (
                    <p className="text-xs text-accent">
                      {selectedAnswers.length} option{selectedAnswers.length > 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              )}
              
              {/* TEXT INPUT */}
              {currentQuestion.type === 'TEXT' && (
                <Input
                  type="text"
                  placeholder="Type your answer..."
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  className="w-full"
                />
              )}
              
              {/* NUMERIC INPUT */}
              {currentQuestion.type === 'NUMERIC' && (
                <Input
                  type="number"
                  placeholder="Enter a number..."
                  value={numericAnswer ?? ''}
                  onChange={(e) => setNumericAnswer(e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full"
                />
              )}
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={submitAnswer}
                  disabled={!canSubmit || loading}
                  className="flex-1 bg-accent text-white hover:bg-accent/90"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                  Submit Answer
                </Button>
                <Button
                  onClick={skipCurrentQuestion}
                  disabled={loading}
                  variant="outline"
                  className="flex-1"
                >
                  <SkipForward className="h-4 w-4 mr-2" />
                  Skip
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render result
  if (step === 'result') {
    return (
      <div className="min-h-screen bg-bg p-6">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Flow Complete!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 border border-border rounded">
                  <div className="text-3xl font-bold text-accent">{answeredCount}</div>
                  <div className="text-sm text-subtle">Answered</div>
                </div>
                <div className="p-4 border border-border rounded">
                  <div className="text-3xl font-bold text-destructive">{skippedCount}</div>
                  <div className="text-sm text-subtle">Skipped</div>
                </div>
                <div className="p-4 border border-border rounded">
                  <div className="text-3xl font-bold text-accent">{totalXp}</div>
                  <div className="text-sm text-subtle">XP Gained</div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={() => {
                  setStep('category');
                  setSelectedCategory('');
                  setAnsweredCount(0);
                  setSkippedCount(0);
                  setTotalXp(0);
                }} className="flex-1">
                  Start New Flow
                </Button>
                <Button onClick={() => router.push('/main')} variant="outline" className="flex-1">
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
