#!/usr/bin/env node

/**
 * Test script to verify that CSV loading fix is working
 * This script checks that the Dashboard component now receives props
 * instead of loading data on its own
 */

const fs = require('fs');
const path = require('path');

// Check Dashboard.tsx file
const dashboardPath = path.join(__dirname, '../src/components/Dashboard.tsx');
const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

// Check ChatbotDashboard.tsx file  
const chatbotDashboardPath = path.join(__dirname, '../src/components/ChatbotDashboard.tsx');
const chatbotDashboardContent = fs.readFileSync(chatbotDashboardPath, 'utf8');

console.log('🔍 Verifying CSV loading fix...\n');

// Test 1: Dashboard should receive props
const hasDashboardProps = dashboardContent.includes('interface DashboardProps') &&
                          dashboardContent.includes('data: DataQualityRecord[]') &&
                          dashboardContent.includes('metrics: DashboardMetrics');

console.log(`✅ Test 1: Dashboard receives props: ${hasDashboardProps ? 'PASS' : 'FAIL'}`);

// Test 2: Dashboard should NOT have loadDashboardData function
const hasLoadFunction = dashboardContent.includes('loadDashboardData');
console.log(`✅ Test 2: Dashboard doesn't load data itself: ${!hasLoadFunction ? 'PASS' : 'FAIL'}`);

// Test 3: Dashboard should NOT have useEffect with fetch
const hasUseEffectFetch = dashboardContent.includes('useEffect') && 
                          dashboardContent.includes('fetch(\'/resources/artifacts/full_summary.csv\')');
console.log(`✅ Test 3: Dashboard doesn't fetch CSV in useEffect: ${!hasUseEffectFetch ? 'PASS' : 'FAIL'}`);

// Test 4: ChatbotDashboard should have the loading logic
const hasChatbotLoading = chatbotDashboardContent.includes('loadDashboardData') &&
                          chatbotDashboardContent.includes('fetch(\'/resources/artifacts/full_summary.csv\')');
console.log(`✅ Test 4: ChatbotDashboard handles CSV loading: ${hasChatbotLoading ? 'PASS' : 'FAIL'}`);

// Test 5: ChatbotDashboard passes props to Dashboard
const passesProps = chatbotDashboardContent.includes('<Dashboard') &&
                    chatbotDashboardContent.includes('data={dashboardState.data}') &&
                    chatbotDashboardContent.includes('metrics={dashboardState.metrics}');
console.log(`✅ Test 5: ChatbotDashboard passes props to Dashboard: ${passesProps ? 'PASS' : 'FAIL'}`);

// Test 6: Loading happens only once in useEffect
const singleLoadEffect = chatbotDashboardContent.includes('useEffect(() => {') &&
                        chatbotDashboardContent.includes('loadDashboardData()') &&
                        chatbotDashboardContent.includes('}, [])');
console.log(`✅ Test 6: CSV loads only once on mount: ${singleLoadEffect ? 'PASS' : 'FAIL'}`);

// Summary
const allTestsPassed = hasDashboardProps && !hasLoadFunction && !hasUseEffectFetch && 
                       hasChatbotLoading && passesProps && singleLoadEffect;

console.log('\n' + '='.repeat(50));
if (allTestsPassed) {
    console.log('🎉 SUCCESS: CSV loading fix is correctly implemented!');
    console.log('The CSV file will now load only once when the app starts,');
    console.log('not every time you switch between views.');
} else {
    console.log('❌ FAILURE: Some tests failed. Please review the implementation.');
}
console.log('='.repeat(50));

process.exit(allTestsPassed ? 0 : 1);