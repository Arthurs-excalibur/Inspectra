const http = require('http');

async function request(path, method, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }
    
    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(responseBody) });
        } catch(e) {
          resolve({ status: res.statusCode, data: responseBody });
        }
      });
    });
    
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  console.log("Starting test...");
  const email = 'test' + Date.now() + '@example.com';
  const password = 'password123';
  
  const auth = await request('/auth/register', 'POST', { email, name: 'Test User', password });
  console.log("Auth:", auth);
  
  if (!auth.data || !auth.data.accessToken) {
    console.error("Failed to authenticate.");
    return;
  }
  
  const token = auth.data.accessToken;
  
  const project = await request('/projects', 'POST', {
    name: 'Test Project',
    baseUrl: 'https://example.com',
    authMode: 'none',
    browser: 'chromium',
    environments: ['production'],
    aiModel: 'google/gemini-2.0-flash-lite-preview-02-05:free'
  }, token);
  
  console.log("Project:", project);
  
  if (!project.data || !project.data.id) {
    console.error("Failed to create project.");
    return;
  }
  
  const session = await request('/sessions/start', 'POST', {
    projectId: project.data.id,
    prompt: 'Click on the "More information..." link and verify it goes to the IANA domain page.'
  }, token);
  
  console.log("Session:", session);
}

run().catch(console.error);
