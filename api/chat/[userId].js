const { proxyRequest } = require("../_utils/proxy");

console.log('[api/chat] handler loaded');

const HF_BASE =
  process.env.HF_BASE_URL || "https://fazalkhan6283683-resume.hf.space";

module.exports = async (req, res) => {
  const userId = req.query?.userId;
  if (!userId) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Missing userId" }));
    return;
  }

  console.log('[api/chat] request for userId=', userId);

  try {
    console.log('[api/chat] proxying request to', `${HF_BASE}/chat/${encodeURIComponent(userId)}`);
    await proxyRequest(req, res, `${HF_BASE}/chat/${encodeURIComponent(userId)}`);
  } catch (e) {
    console.error('[api/chat] upstream error', e && e.stack ? e.stack : e);
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Upstream request failed" }));
  }
};

