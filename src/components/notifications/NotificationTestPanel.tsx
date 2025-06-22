
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotificationTriggers } from '@/hooks/useNotificationTriggers';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Bell, TestTube, Clock, CheckCircle, Package, AlertTriangle, Plus, AlertCircle } from 'lucide-react';

const NotificationTestPanel = () => {
  const { user } = useSupabaseAuth();
  const { 
    triggerTaskCreatedNotification,
    triggerTaskCompletedNotification,
    triggerTaskDueSoonNotification,
    triggerTaskOverdueNotification,
    triggerItemCreatedNotification,
    generateNotificationsManually,
    testNotificationTriggers
  } = useNotificationTriggers();
  
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [results, setResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const testFunction = async (testName: string, testFn: () => Promise<void>) => {
    setIsLoading(testName);
    try {
      await testFn();
      addResult(`✅ ${testName} - Success`);
    } catch (error) {
      addResult(`❌ ${testName} - Error: ${error}`);
      console.error(`Test ${testName} failed:`, error);
    } finally {
      setIsLoading(null);
    }
  };

  const testGenerateAll = async () => {
    try {
      await generateNotificationsManually();
    } catch (error) {
      console.error('Generate all failed:', error);
      throw error;
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-gray-500">Please sign in to test notifications</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          Notification Test Panel
          <Badge variant="outline">Development Only</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Individual Test Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => testFunction('Task Created', () => 
              triggerTaskCreatedNotification('test-task-1', 'Test Task Creation', 'test-item-1')
            )}
            disabled={isLoading === 'Task Created'}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Test Task Created
          </Button>

          <Button
            variant="outline"
            onClick={() => testFunction('Task Completed', () => 
              triggerTaskCompletedNotification('test-task-2', 'Test Task Completion', 'test-item-2')
            )}
            disabled={isLoading === 'Task Completed'}
            className="flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Test Task Completed
          </Button>

          <Button
            variant="outline"
            onClick={() => testFunction('Task Due Soon', () => 
              triggerTaskDueSoonNotification('test-task-3', 'Test Task Due Soon', new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), 'test-item-3')
            )}
            disabled={isLoading === 'Task Due Soon'}
            className="flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Test Task Due Soon
          </Button>

          <Button
            variant="outline"
            onClick={() => testFunction('Task Overdue', () => 
              triggerTaskOverdueNotification('test-task-4', 'Test Task Overdue', new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), 'test-item-4')
            )}
            disabled={isLoading === 'Task Overdue'}
            className="flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Test Task Overdue
          </Button>

          <Button
            variant="outline"
            onClick={() => testFunction('Item Created', () => 
              triggerItemCreatedNotification('test-item-5', 'Test Item Creation')
            )}
            disabled={isLoading === 'Item Created'}
            className="flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            Test Item Created
          </Button>

          <Button
            variant="outline"
            onClick={() => testFunction('Generate All', testGenerateAll)}
            disabled={isLoading === 'Generate All'}
            className="flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            Generate All
          </Button>
        </div>

        {/* Run All Tests Button */}
        <Button
          onClick={() => testFunction('All Tests', testNotificationTriggers)}
          disabled={!!isLoading}
          className="w-full flex items-center gap-2"
        >
          <TestTube className="w-4 h-4" />
          {isLoading ? `Running ${isLoading}...` : 'Run All Tests'}
        </Button>

        {/* Results Display */}
        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Test Results:</h4>
            <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto">
              {results.map((result, index) => (
                <div key={index} className="text-xs font-mono mb-1">
                  {result}
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setResults([])}
              className="text-xs"
            >
              Clear Results
            </Button>
          </div>
        )}

        {/* Usage Instructions */}
        <div className="text-xs text-gray-600 space-y-1">
          <p><strong>Usage:</strong></p>
          <p>• Individual buttons test specific notification types</p>
          <p>• "Task Due Soon" and "Task Overdue" test status change notifications</p>
          <p>• "Generate All" runs the scheduled notification check</p>
          <p>• "Run All Tests" triggers all notification types at once</p>
          <p>• Check the notification bell to see created notifications</p>
          <p>• All notifications respect user preferences from settings</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationTestPanel;
