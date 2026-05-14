# Legacy assets

`app.legacy.js` is a pre-Vite browser bundle kept only for reference.

Production must use the Vite entrypoint in `index.html`:

```html
<script type="module" src="/src/main.jsx"></script>
```

Do not import this legacy bundle from `index.html` or deploy it as the active app entrypoint.
