/**
 * tools/concurrencyTest.js
 * Run from backend root:
 *   node tools/concurrencyTest.js
 *
 * This script logs in (seeded student), picks a next question, then
 * sends N parallel POSTs to /api/attempts using the SAME Idempotency-Key.
 * It prints responses and a final re-login to show points.
 */
const axios = require('axios');

const BASE = 'http://localhost:5000';
const EMAIL = 'student1@example.com';
const PASSWORD = 'P@ssword123';
const PARALLEL = 20;

(async function main(){
  try {
    // login
    const login = await axios.post(`${BASE}/api/auth/login`, { email: EMAIL, password: PASSWORD });
    const token = login.data.token;
    console.log('token preview:', String(token).slice(0,12)+'...');

    const headers = { Authorization: `Bearer ${token}` };

    // get next question
    const qResp = await axios.get(`${BASE}/api/questions/next`, { headers });
    const q = qResp.data;
    console.log('Question:', q._id, q.text, 'type=', q.type);

    const givenAnswer = (q.choices && q.choices[0] && q.choices[0].text) ? q.choices[0].text : 'Hyper Text Markup Language';
    const idem = require('crypto').randomUUID();
    const body = { questionId: q._id, givenAnswer, timeSeconds: 45 };

    console.log(`Sending ${PARALLEL} parallel POSTs with same Idempotency-Key: ${idem}`);

    const jobs = Array.from({ length: PARALLEL }).map(() =>
      axios.post(`${BASE}/api/attempts`, body, { headers: { ...headers, 'Idempotency-Key': idem } })
        .then(r => ({ status: r.status, data: r.data }))
        .catch(e => ({ err: e.response ? (e.response.data || e.response.status) : e.message }))
    );

    const results = await Promise.all(jobs);
    let success = 0;
    results.forEach((r, i) => {
      if (r.status && r.status === 200) {
        success++;
      }
    });
    console.log('Responses count:', results.length, 'successful HTTP 200 count:', success);

    // show one of the successful responses (first)
    const firstOk = results.find(r => r.status === 200);
    console.log('One successful response body (first):', JSON.stringify(firstOk && firstOk.data, null, 2));

    // re-login to inspect user points (fresh data)
    const after = await axios.post(`${BASE}/api/auth/login`, { email: EMAIL, password: PASSWORD });
    console.log('Re-login user (points):', JSON.stringify(after.data.user, null, 2));
  } catch (err) {
    console.error('Test error:', err && (err.response ? err.response.data : err.message));
    process.exit(1);
  }
})();
