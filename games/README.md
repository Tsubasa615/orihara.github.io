# Unity WebGL builds

This folder holds playable Unity WebGL exports for the devlog.

For Devlog 001, export the Unity project using **File → Build Settings → WebGL → Build** and choose:

```
games/devlog-001
```

The devlog already embeds `games/devlog-001/index.html`. Replace the starter page in that folder with Unity's generated `Build/`, `TemplateData/`, and `index.html`, keeping those files together. The blog layout will then load the playable build automatically.

Tip: use Unity's `Decompression Fallback` player setting if the site host does not send Brotli or gzip compression headers for `.br` / `.gz` build files.
