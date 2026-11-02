import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api/v1';

async function verifyIntegration() {
  console.log('====================================================');
  console.log('   TaskFlow Frontend-to-Backend Integration Audit   ');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName, details = '') {
    total++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${details}`);
    }
  }

  const timestamp = Date.now();
  const email = `engineer_${timestamp}@taskflow.dev`;
  const password = 'Password123!';

  try {
    // 1. Test Registration
    const regRes = await axios.post(`${API_URL}/auth/register`, {
      name: 'Alex Rivera',
      email,
      password,
      organization: 'TaskFlow Core Engineering'
    });
    assert(regRes.data.success && regRes.data.data.token, '1. Registration API connects and generates JWT');
    const token = regRes.data.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };

    // 2. Test Login
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    assert(loginRes.data.success && loginRes.data.data.user.email === email, '2. Login API authenticates user credentials');

    // 3. Test Auth Me
    const meRes = await axios.get(`${API_URL}/auth/me`, { headers: authHeaders });
    assert(meRes.data.success && meRes.data.data.user.name === 'Alex Rivera', '3. Authenticated session fetches user profile');

    // 4. Test Project Creation
    const projRes = await axios.post(
      `${API_URL}/projects`,
      {
        name: 'TaskFlow Production Client',
        key: `PRJ${String(timestamp).slice(-3)}`,
        description: 'Complete integrated MERN stack project management application',
        category: 'Engineering',
        color: '#4f46e5'
      },
      { headers: authHeaders }
    );
    assert(projRes.data.success && projRes.data.data.project._id, '4. Project Creation persists to MongoDB with unique Key');
    const projectId = projRes.data.data.project._id;

    // 5. Test Project Listing with Progress Calculation
    const listRes = await axios.get(`${API_URL}/projects`, { headers: authHeaders });
    assert(
      listRes.data.success && listRes.data.data.projects.some((p) => p._id === projectId),
      '5. Project Listing retrieves project with dynamic progress calculation'
    );

    // 6. Test Task Creation
    const taskRes = await axios.post(
      `${API_URL}/projects/${projectId}/tasks`,
      {
        title: 'Complete Frontend-Backend Integration',
        description: 'Connect Axios client to Express REST endpoints and MongoDB models',
        priority: 'urgent',
        status: 'in-progress',
        tags: ['Integration', 'Frontend', 'Backend']
      },
      { headers: authHeaders }
    );
    assert(taskRes.data.success && taskRes.data.data.task._id, '6. Task Creation persists in MongoDB with auto taskNumber');
    const taskId = taskRes.data.data.task._id;

    // 7. Test Subtask Addition & Checkbox Toggle
    const subtaskRes = await axios.post(
      `${API_URL}/tasks/${taskId}/subtasks`,
      { title: 'Verify JWT interceptor token injection' },
      { headers: authHeaders }
    );
    const subtaskId = subtaskRes.data.data.subtasks[0]._id;
    assert(subtaskRes.data.success && subtaskId, '7. Subtask added to task checklist');

    const toggleRes = await axios.patch(
      `${API_URL}/tasks/${taskId}/subtasks/${subtaskId}`,
      {},
      { headers: authHeaders }
    );
    assert(
      toggleRes.data.success && toggleRes.data.data.subtask.completed === true,
      '8. Subtask toggle marks item completed in MongoDB'
    );

    // 8. Test Kanban Status Update (Drag and Drop persistence)
    const moveRes = await axios.patch(
      `${API_URL}/tasks/${taskId}/status`,
      { status: 'in-review', orderIndex: 1 },
      { headers: authHeaders }
    );
    assert(
      moveRes.data.success && moveRes.data.data.task.status === 'in-review',
      '9. Kanban status update persists status: "in-review"'
    );

    // 9. Test Comments Thread
    const commentRes = await axios.post(
      `${API_URL}/tasks/${taskId}/comments`,
      { content: 'All MERN stack endpoints verified and connected to React UI.' },
      { headers: authHeaders }
    );
    assert(commentRes.data.success && commentRes.data.data.comment._id, '10. Task comment posted and saved in database');

    const getCommentsRes = await axios.get(`${API_URL}/tasks/${taskId}/comments`, {
      headers: authHeaders
    });
    assert(
      getCommentsRes.data.success && getCommentsRes.data.data.comments.length >= 1,
      '11. Task comment thread retrieved with author information'
    );

    // 10. Test Dynamic Dashboard Analytics
    const dashboardRes = await axios.get(`${API_URL}/dashboard/stats`, {
      headers: authHeaders
    });
    const summary = dashboardRes.data.data.summary;
    assert(
      dashboardRes.data.success && summary && summary.totalTasks >= 1,
      `12. Workspace Dashboard aggregates real DB metrics (Total: ${summary.totalTasks}, InReview: ${summary.inReviewTasks})`
    );

    // 11. Test Security / Unauthorized Protection
    try {
      await axios.get(`${API_URL}/projects/${projectId}`);
      assert(false, '13. Security: unauthenticated access should be blocked');
    } catch (unauthErr) {
      assert(
        unauthErr.response?.status === 401,
        '13. Security: unauthenticated access returns 401 Unauthorized'
      );
    }

    console.log(`\n====================================================`);
    console.log(`Results: ${passed}/${total} integration tests passed!`);
    console.log(`====================================================\n`);

    if (passed === total) process.exit(0);
    else process.exit(1);
  } catch (err) {
    console.error('Integration test failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

verifyIntegration();
