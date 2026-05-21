# Legacy assets

The pre-Vite browser bundle was removed because it contained obsolete group-selection logic.

Production must use the Vite entrypoint in `index.html`:

```html
<script type="module" src="/src/main.jsx"></script>
```

Do not import this legacy bundle from `index.html` or deploy it as the active app entrypoint.
