const { proxyRequest } = require("./_utils/proxy");

console.log('[api/items] handler loaded');

const HF_BASE =
  process.env.HF_BASE_URL || "https://fazalkhan6283683-resume.hf.space";

module.exports = async (req, res) => {
  try {
    console.log('[api/items] proxying request to', `${HF_BASE}/items`);
    await proxyRequest(req, res, `${HF_BASE}/items`);
  } catch (e) {
    console.error('[api/items] upstream error', e && e.stack ? e.stack : e);
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Upstream request failed" }));
  }
};

