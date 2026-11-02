const http = require('http');

const API_BASE = 'http://127.0.0.1:5000/api/v1';

async function request(endpoint, options = {}) {
  const url = new URL(`${API_BASE}${endpoint}`);
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const req = http.request(
      url,
      {
        method: options.method || 'GET',
        headers
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => (rawData += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(rawData);
          } catch (e) {
            parsed = rawData;
          }
          resolve({ status: res.statusCode, data: parsed });
        });
      }
    );

    req.on('error', (err) => reject(err));

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('   TaskFlow Backend Automated Verification Suite    ');
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

  try {
    // 1. Health check
    const health = await request('/health');
    assert(health.status === 200 && health.data.success, 'GET /health returns 200 operational');

    // Clean unique timestamp to avoid duplicate collision across runs
    const timestamp = Date.now();
    const user1Email = `lead_${timestamp}@taskflow.dev`;
    const user2Email = `elena_${timestamp}@taskflow.dev`;

    // 2. Register User 1
    const regUser1 = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Alex Rivera',
        email: user1Email,
        password: 'Password123!',
        organization: 'Acme Cloud'
      }
    });
    assert(
      regUser1.status === 201 && regUser1.data.data.token,
      'POST /auth/register creates user and returns JWT'
    );
    const token1 = regUser1.data?.data?.token;

    // 3. Register User 2
    const regUser2 = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Elena Rostova',
        email: user2Email,
        password: 'Password123!',
        organization: 'Acme Cloud'
      }
    });
    assert(
      regUser2.status === 201 && regUser2.data.data.token,
      'POST /auth/register creates second user'
    );
    const token2 = regUser2.data?.data?.token;
    const user2Id = regUser2.data?.data?.user?._id;

    // 4. Login User 1
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: {
        email: user1Email,
        password: 'Password123!'
      }
    });
    assert(
      loginRes.status === 200 && loginRes.data.data.token,
      'POST /auth/login authenticates user'
    );

    // 5. Auth /me Protected
    const meRes = await request('/auth/me', {
      headers: { Authorization: `Bearer ${token1}` }
    });
    assert(
      meRes.status === 200 && meRes.data.data.user.email === user1Email,
      'GET /auth/me returns authenticated user profile'
    );

    // 6. Security Negative Test: Unauthorized Request without token
    const noAuthRes = await request('/projects');
    assert(
      noAuthRes.status === 401,
      'GET /projects without token returns 401 Unauthorized'
    );

    // 7. Create Project
    const createProj = await request('/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: {
        name: 'TaskFlow Architecture',
        description: 'Core micro-services and state architecture',
        key: `TF${String(timestamp).slice(-3)}`,
        color: '#4f46e5',
        category: 'Engineering'
      }
    });
    assert(
      createProj.status === 201 && createProj.data.data.project._id,
      'POST /projects creates project with caller as owner'
    );
    const projectId = createProj.data?.data?.project?._id;

    // 8. Add Member to Project
    const addMemberRes = await request(`/projects/${projectId}/members`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: {
        email: user2Email,
        role: 'member'
      }
    });
    assert(
      addMemberRes.status === 200,
      'POST /projects/:id/members adds team member with role'
    );

    // 9. Create Task
    const createTaskRes = await request(`/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: {
        title: 'Architect JWT refresh token rotation',
        description: 'Add secure http-only cookie tokens with audit trail',
        status: 'todo',
        priority: 'urgent',
        assignee: user2Id,
        tags: ['Security', 'Backend']
      }
    });
    assert(
      createTaskRes.status === 201 && createTaskRes.data.data.task._id,
      'POST /projects/:id/tasks creates task with auto-generated taskNumber'
    );
    const taskId = createTaskRes.data?.data?.task?._id;
    const taskNumber = createTaskRes.data?.data?.task?.taskNumber;
    console.log(`       > Generated Task ID: ${taskId} (${taskNumber})`);

    // 10. Update Task Status (Kanban Move)
    const moveTaskRes = await request(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token2}` },
      body: {
        status: 'in-progress',
        orderIndex: 0
      }
    });
    assert(
      moveTaskRes.status === 200 && moveTaskRes.data.data.task.status === 'in-progress',
      'PATCH /tasks/:id/status updates status to in-progress'
    );

    // 11. Add Subtask
    const subtaskRes = await request(`/tasks/${taskId}/subtasks`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token2}` },
      body: {
        title: 'Generate cryptographically random refresh secret'
      }
    });
    assert(
      subtaskRes.status === 201 && subtaskRes.data.data.subtasks.length > 0,
      'POST /tasks/:id/subtasks adds checklist item'
    );
    const subtaskId = subtaskRes.data?.data?.subtasks[0]?._id;

    // 12. Toggle Subtask Complete
    const toggleRes = await request(`/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token2}` }
    });
    assert(
      toggleRes.status === 200 && toggleRes.data.data.subtask.completed === true,
      'PATCH /tasks/:id/subtasks/:subId toggles subtask to completed'
    );

    // 13. Add Comment to Task
    const commentRes = await request(`/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token2}` },
      body: {
        content: 'JWT refresh token rotation is ready for code review.'
      }
    });
    assert(
      commentRes.status === 201 && commentRes.data.data.comment._id,
      'POST /tasks/:id/comments posts comment to task'
    );

    // 14. Get Comments
    const getCommentsRes = await request(`/tasks/${taskId}/comments`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    assert(
      getCommentsRes.status === 200 && getCommentsRes.data.data.comments.length === 1,
      'GET /tasks/:id/comments returns task comments thread'
    );

    // 15. Live Workspace Dashboard Analytics
    const dashboardRes = await request('/dashboard/stats', {
      headers: { Authorization: `Bearer ${token1}` }
    });
    const stats = dashboardRes.data?.data?.summary;
    assert(
      dashboardRes.status === 200 && stats && stats.totalTasks >= 1,
      `GET /dashboard/stats calculates dynamic metrics (Total: ${stats?.totalTasks}, InProgress: ${stats?.inProgressTasks})`
    );

    // 16. Security Authorization Check: Member cannot delete project (Owner only)
    const unauthorizedDelete = await request(`/projects/${projectId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token2}` } // Elena is member, not owner
    });
    assert(
      unauthorizedDelete.status === 403,
      'DELETE /projects/:id by non-owner returns 403 Forbidden'
    );

    console.log(`\n====================================================`);
    console.log(`Results: ${passed}/${total} backend integration tests passed!`);
    console.log(`====================================================\n`);

    if (passed === total) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution failed with error:', err);
    process.exit(1);
  }
}

runTests();
