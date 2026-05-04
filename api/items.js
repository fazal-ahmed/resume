const { proxyRequest } = require("./_utils/proxy");

const HF_BASE =
  process.env.HF_BASE_URL || "https://fazalkhan6283683-resume.hf.space";

module.exports = async (req, res) => {
  try {
    await proxyRequest(req, res, `${HF_BASE}/items`);
  } catch (e) {
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Upstream request failed" }));
  }
};

