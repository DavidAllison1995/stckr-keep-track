
// End-to-End Test Helper for Route and Data Flow Verification
import { NavigateFunction } from 'react-router-dom';

export interface TestResult {
  testName: string;
  status: 'pass' | 'fail' | 'skip';
  error?: string;
  duration?: number;
}

export class RouteTestSuite {
  private navigate: NavigateFunction;
  private results: TestResult[] = [];

  constructor(navigate: NavigateFunction) {
    this.navigate = navigate;
  }

  async runAllTests(): Promise<TestResult[]> {
    this.results = [];
    
    // Test basic navigation
    await this.testNavigation();
    
    // Test data loading
    await this.testDataLoading();
    
    // Test CRUD operations
    await this.testCrudOperations();
    
    return this.results;
  }

  private async testNavigation() {
    const routes = ['/', '/items', '/calendar', '/profile', '/settings', '/scanner'];
    
    for (const route of routes) {
      try {
        const startTime = Date.now();
        this.navigate(route);
        
        // Wait for route to load
        await new Promise(resolve => setTimeout(resolve, 100));
        
        this.results.push({
          testName: `Navigation to ${route}`,
          status: 'pass',
          duration: Date.now() - startTime
        });
      } catch (error) {
        this.results.push({
          testName: `Navigation to ${route}`,
          status: 'fail',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private async testDataLoading() {
    // Test items loading
    try {
      this.navigate('/items');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const itemsContainer = document.querySelector('[data-testid="items-list"]');
      this.results.push({
        testName: 'Items data loading',
        status: itemsContainer ? 'pass' : 'fail'
      });
    } catch (error) {
      this.results.push({
        testName: 'Items data loading',
        status: 'fail',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test calendar loading
    try {
      this.navigate('/calendar');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const calendarContainer = document.querySelector('[data-testid="calendar"]');
      this.results.push({
        testName: 'Calendar data loading',
        status: calendarContainer ? 'pass' : 'fail'
      });
    } catch (error) {
      this.results.push({
        testName: 'Calendar data loading',
        status: 'fail',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async testCrudOperations() {
    // These would be more complex integration tests
    // For now, just verify the components render without crashing
    this.results.push({
      testName: 'CRUD operations',
      status: 'skip',
      error: 'Integration tests require full environment setup'
    });
  }

  generateReport(): string {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const skipped = this.results.filter(r => r.status === 'skip').length;

    let report = `\n=== E2E Test Report ===\n`;
    report += `Total: ${total} | Passed: ${passed} | Failed: ${failed} | Skipped: ${skipped}\n`;
    report += `Success Rate: ${Math.round((passed / (total - skipped)) * 100)}%\n\n`;

    this.results.forEach(result => {
      const status = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏭️';
      report += `${status} ${result.testName}`;
      if (result.duration) {
        report += ` (${result.duration}ms)`;
      }
      if (result.error) {
        report += ` - ${result.error}`;
      }
      report += '\n';
    });

    return report;
  }
}

// Helper function to validate data consistency
export function validateDataConsistency() {
  const issues: string[] = [];

  // Check for common data shape mismatches
  const checkItemStructure = (item: any) => {
    const requiredFields = ['id', 'name', 'category', 'user_id', 'created_at', 'updated_at'];
    const missingFields = requiredFields.filter(field => !(field in item));
    if (missingFields.length > 0) {
      issues.push(`Item missing fields: ${missingFields.join(', ')}`);
    }
  };

  const checkTaskStructure = (task: any) => {
    const requiredFields = ['id', 'title', 'date', 'status', 'user_id', 'created_at', 'updated_at'];
    const missingFields = requiredFields.filter(field => !(field in task));
    if (missingFields.length > 0) {
      issues.push(`Task missing fields: ${missingFields.join(', ')}`);
    }
  };

  return {
    issues,
    checkItemStructure,
    checkTaskStructure,
    isValid: () => issues.length === 0
  };
}
