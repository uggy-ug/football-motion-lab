# Football Motion Lab — v0.1

A publish-first prototype for data-driven football skill visualisation.

## Included

- Interactive WebGL player and ball scene
- Orbiting camera and four preset views
- Play, pause, restart, speed and frame scrubbing
- Four instructional phases for a Single Step Over
- Weight distribution and active-leg visualisation
- Trick definition separated from rendering in `trick.js`

## Run locally

Because ES modules require an HTTP origin:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Publish

The folder is static and can be deployed directly to GitHub Pages, Cloudflare Pages, Netlify or Vercel. No build command is required.

## Next technical increment

Replace procedural leg transforms with a formal joint keyframe schema, add centre-of-mass overlays, contact events, mirroring, and JSON validation.
