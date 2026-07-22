const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

async function proxyRequest(req, res, targetUrl) {
  setCors(res);

  console.log('[api/_utils/proxy] proxyRequest', { method: req.method, url: req.url, target: targetUrl });

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  const upstreamRes = await fetch(targetUrl, {
    method: req.method,
    headers: {
      ...req.headers,
      host: new URL(targetUrl).host,
    },
    body: req.method === "GET" || req.method === "HEAD" ? undefined : req,
    redirect: "manual",
  });

  res.statusCode = upstreamRes.status;
  console.log('[api/_utils/proxy] upstream status', upstreamRes.status);

  upstreamRes.headers.forEach((value, key) => {
    if (key.toLowerCase() === "transfer-encoding") return;
    res.setHeader(key, value);
  });

  const buf = Buffer.from(await upstreamRes.arrayBuffer());
  res.end(buf);
}

module.exports = { proxyRequest };

