export default {
  async fetch(request: Request, env: any) {
    const url = new URL(request.url);

    // Redirect route: GET /<shortId>
    if (request.method === "GET" && url.pathname.length > 1) {
      const shortId = url.pathname.slice(1);
      const longUrl = await env.URLS.get(shortId);

      if (longUrl) {
        return Response.redirect(longUrl, 302);
      } else {
        return new Response(JSON.stringify({ error: "Not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Create short URL: POST /shorten
    if (request.method === "POST" && url.pathname === "/shorten") {
      try {
        const { longUrl } = await request.json();
        if (!longUrl) throw new Error("Missing longUrl");

        // Generate a short ID (6 characters)
        const shortId = Math.random().toString(36).substring(2, 8);

        // Store in KV
        await env.URLS.put(shortId, longUrl);

        const shortUrl = `${url.origin}/${shortId}`;
        return new Response(JSON.stringify({ shortUrl }), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Default route
    return new Response("URL Shortener Worker is running!", { status: 200 });
  }, // <-- closes async fetch
};   // <-- closes export default
