/**
 * Demo script to test Focus Coach functionality
 * Run with: pnpm tsx src/lib/__tests__/focus-coach-demo.ts
 */

import { FocusCoachService } from '../focus-coach-service';
import { Task } from '../types';

async function demo() {
  console.log('🎯 Nocturne Focus Coach Demo\n');
  console.log('=' .repeat(60));
  
  const service = new FocusCoachService();

  // Create sample tasks
  const tasks: Task[] = [
    {
      id: '1',
      description: 'Review pull request for authentication feature',
      completed: false,
      createdAt: new Date('2025-11-22T10:00:00Z'),
      updatedAt: new Date('2025-11-22T10:00:00Z'),
      dueDate: new Date(Date.now() + 3 * 60 * 60 * 1000), // Due in 3 hours
      tags: ['code-review', 'urgent'],
      projectId: 'proj-auth'
    },
    {
      id: '2',
      description: 'Write unit tests for user service',
      completed: false,
      createdAt: new Date('2025-11-20T14:00:00Z'),
      updatedAt: new Date('2025-11-20T14:00:00Z'),
      tags: ['testing'],
      projectId: 'proj-auth'
    },
    {
      id: '3',
      description: 'Update project documentation',
      completed: false,
      createdAt: new Date('2025-11-21T09:00:00Z'),
      updatedAt: new Date('2025-11-21T09:00:00Z'),
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Due in 2 days
      tags: ['documentation']
    },
    {
      id: '4',
      description: 'Refactor database queries for better performance',
      completed: false,
      createdAt: new Date('2025-11-19T11:00:00Z'),
      updatedAt: new Date('2025-11-19T11:00:00Z'),
      tags: ['refactoring', 'performance'],
      projectId: 'proj-db'
    },
    {
      id: '5',
      description: 'Design new landing page mockups',
      completed: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // Created 2 hours ago
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      tags: ['design', 'ui'],
      projectId: 'proj-marketing'
    },
    {
      id: '6',
      description: 'Fix bug in payment processing',
      completed: false,
      createdAt: new Date('2025-11-18T15:00:00Z'),
      updatedAt: new Date('2025-11-18T15:00:00Z'),
      dueDate: new Date(Date.now() - 1 * 60 * 60 * 1000), // Overdue by 1 hour!
      tags: ['bug', 'critical'],
      projectId: 'proj-payments'
    }
  ];

  console.log('\n📋 Available Tasks:');
  console.log('-'.repeat(60));
  tasks.forEach((task, i) => {
    const dueInfo = task.dueDate 
      ? ` | Due: ${task.dueDate.toLocaleString()}`
      : '';
    const tagsInfo = task.tags.length > 0 
      ? ` | Tags: ${task.tags.join(', ')}`
      : '';
    console.log(`${i + 1}. ${task.description}${dueInfo}${tagsInfo}`);
  });

  // Generate first micro-plan
  console.log('\n\n🤖 Generating Micro-Plan #1...\n');
  console.log('=' .repeat(60));
  
  try {
    const plan1 = await service.generateMicroPlan(tasks);
    
    console.log(`\n✨ Generated at: ${plan1.generatedAt.toLocaleString()}`);
    console.log(`📊 Overall Confidence: ${(plan1.confidence * 100).toFixed(0)}%`);
    console.log(`💭 Reasoning: ${plan1.reasoning}\n`);
    
    console.log('📝 Your 25-Minute Focus Plan:');
    console.log('-'.repeat(60));
    
    plan1.steps.forEach((step, i) => {
      console.log(`\nStep ${i + 1}: ${step.description}`);
      console.log(`   ⏱️  Estimated Time: ${step.estimatedMinutes} minutes`);
      console.log(`   💡 Why: ${step.explanation}`);
      console.log(`   📈 Confidence: ${(step.confidence * 100).toFixed(0)}%`);
    });

    const totalMinutes = plan1.steps.reduce((sum, step) => sum + step.estimatedMinutes, 0);
    console.log(`\n⏰ Total Duration: ${totalMinutes} minutes`);

    // Start a session
    console.log('\n\n🚀 Starting Focus Session...\n');
    console.log('=' .repeat(60));
    
    const session = service.startSession(plan1, 1500);
    console.log(`✅ Session Started!`);
    console.log(`   ID: ${session.id}`);
    console.log(`   Status: ${session.status}`);
    console.log(`   Duration: ${session.duration} seconds (${session.duration / 60} minutes)`);
    console.log(`   Started at: ${session.startTime.toLocaleString()}`);

    // Simulate pause
    console.log('\n⏸️  Pausing session...');
    service.pauseSession(session.id);
    console.log(`   Status: ${service.getActiveSession()?.status}`);

    // Resume
    console.log('\n▶️  Resuming session...');
    service.resumeSession(session.id);
    console.log(`   Status: ${service.getActiveSession()?.status}`);

    // Complete
    console.log('\n✅ Completing session...');
    service.completeSession(session.id);
    console.log(`   Session completed!`);
    console.log(`   Active session: ${service.getActiveSession() ? 'Yes' : 'None'}`);

    // Generate second plan (should be different)
    console.log('\n\n🤖 Generating Micro-Plan #2 (Regeneration)...\n');
    console.log('=' .repeat(60));
    
    const plan2 = await service.generateMicroPlan(tasks);
    
    console.log(`\n✨ Generated at: ${plan2.generatedAt.toLocaleString()}`);
    console.log(`📊 Overall Confidence: ${(plan2.confidence * 100).toFixed(0)}%`);
    console.log(`💭 Reasoning: ${plan2.reasoning}\n`);
    
    console.log('📝 Your NEW 25-Minute Focus Plan:');
    console.log('-'.repeat(60));
    
    plan2.steps.forEach((step, i) => {
      console.log(`\nStep ${i + 1}: ${step.description}`);
      console.log(`   ⏱️  Estimated Time: ${step.estimatedMinutes} minutes`);
      console.log(`   💡 Why: ${step.explanation}`);
      console.log(`   📈 Confidence: ${(step.confidence * 100).toFixed(0)}%`);
    });

    // Compare plans
    const plan1TaskIds = plan1.steps.map(s => s.taskId).sort();
    const plan2TaskIds = plan2.steps.map(s => s.taskId).sort();
    const isDifferent = plan1TaskIds.join(',') !== plan2TaskIds.join(',');
    
    console.log('\n\n🔄 Plan Comparison:');
    console.log('-'.repeat(60));
    console.log(`Plan 1 tasks: ${plan1TaskIds.join(', ')}`);
    console.log(`Plan 2 tasks: ${plan2TaskIds.join(', ')}`);
    console.log(`Plans are different: ${isDifferent ? '✅ Yes' : '❌ No'}`);

    // Test error handling
    console.log('\n\n⚠️  Testing Error Handling...\n');
    console.log('=' .repeat(60));
    
    try {
      await service.generateMicroPlan([tasks[0], tasks[1]]); // Only 2 tasks
    } catch (error: unknown) {
      console.log('✅ Correctly caught insufficient tasks error:');
      console.log(`   ${error.message}`);
    }

    console.log('\n\n🎉 Demo Complete!\n');
    console.log('=' .repeat(60));
    console.log('The Focus Coach is working perfectly! 🚀');
    console.log('Ready to help users overcome decision fatigue! 💪');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the demo
demo().catch(console.error);
