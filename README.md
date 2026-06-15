# Prompt Token Keyword Optimizer

Static Cloudflare Pages web app that extracts keywords from a one-shot prompt, renders a clickable mindmap, helps build a more detailed prompt, estimates token growth, and optionally saves a session to Firebase Firestore.

## Local Run

No build step is required.

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## Cloudflare Pages Deploy

1. Create a Cloudflare Pages project.
2. Connect this repository or upload the folder.
3. Set build command to empty.
4. Set output directory to `/` or leave the default static root.
5. Deploy.

## Firebase Setup

Firebase initialization is in `assets/js/firebase.js`. The app imports Firebase Web SDK modules by CDN URL and writes only to the `prompt_sessions` collection when the user clicks Save Session.

The Firebase Web API key is public by design, but Firestore Security Rules must protect writes and reads.

Example starter rules:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /prompt_sessions/{docId} {
      allow create: if request.resource.data.keys().hasOnly([
        'originalPrompt',
        'optimizedPrompt',
        'language',
        'extractedKeywords',
        'selectedKeywords',
        'estimatedOriginalTokens',
        'estimatedOptimizedTokens',
        'detailScore',
        'createdAt'
      ])
      && request.resource.data.originalPrompt is string
      && request.resource.data.optimizedPrompt is string
      && request.resource.data.language is string
      && request.resource.data.extractedKeywords is list
      && request.resource.data.selectedKeywords is list
      && request.resource.data.estimatedOriginalTokens is int
      && request.resource.data.estimatedOptimizedTokens is int
      && request.resource.data.detailScore is int;
      allow read, update, delete: if false;
    }
  }
}
```

## SEO and AdSense

`index.html` includes title, description, canonical URL, Open Graph, Twitter Card, viewport, JSON-LD, and an advertisement placeholder. Replace the placeholder publisher ID in comments and `ads.txt` after Google AdSense approval.

## Naver Search Advisor

Replace this placeholder in HTML files:

```html
<meta name="naver-site-verification" content="YOUR_NAVER_VERIFICATION_CODE">
```

Submit `robots.txt` and `sitemap.xml` after deploying to the final Cloudflare Pages domain.

## Future AI API Integration

The current version runs keyword extraction and expansion entirely in the browser. A later version can call an AI API through a Cloudflare Worker to generate higher-quality keywords, semantic clusters, and model-specific token counts without exposing private API keys to the client.
