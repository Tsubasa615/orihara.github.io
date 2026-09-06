(() => {
  const storageKey = "pedas-terasi-post-manager";
  const form = document.querySelector("[data-post-form]");
  const output = document.querySelector("[data-output]");
  const copyButton = document.querySelector("[data-copy]");
  const downloadButton = document.querySelector("[data-download]");
  const copyNote = document.querySelector("[data-copy-note]");
  const list = document.querySelector("[data-manage-list]");
  const saveButton = document.querySelector("[data-save-post]");
  const cancelButton = document.querySelector("[data-cancel-edit]");
  const resetButton = document.querySelector("[data-reset]");
  const buildButton = document.querySelector("[data-build]");
  const picker = document.querySelector("[data-post-picker]");
  const deleteCurrentButton = document.querySelector("[data-delete-current]");
  const publishedPosts = JSON.parse(JSON.stringify(posts));
  let workingPosts = loadPosts();
  let editingIndex = null;

  form.elements.date.value = new Date().toISOString().slice(0, 10);

  function loadPosts() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      return Array.isArray(saved) ? saved : JSON.parse(JSON.stringify(posts));
    } catch { return JSON.parse(JSON.stringify(posts)); }
  }
  function savePosts() { localStorage.setItem(storageKey, JSON.stringify(workingPosts)); }
  function makeSlug(text) { return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "my-new-note"; }
  function dateLabel(value) { return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`)); }
  function toBlocks(body) {
    return body.split(/\n\s*\n/).filter((block) => block.trim()).map((block) => {
      const value = block.trim();
      const special = value.match(/^\[(image|link|unity):\s*(.*?)\]$/i);
      if (special) {
        const parts = special[2].split("|").map((part) => part.trim());
        if (special[1].toLowerCase() === "image" && parts[0]) return { type: "image", src: parts[0], alt: parts[1] || "", caption: parts[2] || "" };
        if (special[1].toLowerCase() === "link" && parts[0] && parts[1]) return { type: "link", label: parts[0], url: parts[1] };
        if (special[1].toLowerCase() === "unity" && parts[0]) return { type: "unity", src: parts[0], title: parts[1] || "Playable Unity game", caption: parts[2] || "" };
      }
      if (value.startsWith("# ")) return { type: "heading", text: value.slice(2).trim() };
      if (value.startsWith("> ")) return { type: "quote", text: value.slice(2).trim() };
      return { type: "p", text: value };
    });
  }
  function blocksToText(content) {
    return content.map((block) => block.type === "heading" ? `# ${block.text}` : block.type === "quote" ? `> ${block.text}` : block.type === "link" ? `[link: ${block.label} | ${block.url}]` : block.type === "image" ? `[image: ${block.src} | ${block.alt || ""} | ${block.caption || ""}]` : block.type === "unity" ? `[unity: ${block.src} | ${block.title || "Playable Unity game"} | ${block.caption || ""}]` : block.text).join("\n\n");
  }
  function formPost() {
    const values = Object.fromEntries(new FormData(form));
    const content = toBlocks(values.body);
    const post = { slug: makeSlug(values.title), date: values.date, dateLabel: dateLabel(values.date), tags: values.tags.split(",").map((tag) => tag.trim()).filter(Boolean), title: values.title.trim(), summary: values.summary.trim(), cover: values.cover, content };
    if (values.image.trim()) { post.image = values.image.trim(); post.imageAlt = values.imageAlt.trim(); }
    return post;
  }
  function exportText() { return `const posts = ${JSON.stringify(workingPosts, null, 2)};\n`; }
  function render() {
    output.value = exportText();
    picker.innerHTML = `<option value="">New post</option>${workingPosts.map((post, index) => `<option value="${index}">${post.title}</option>`).join("")}`;
    if (editingIndex !== null) picker.value = editingIndex;
    list.innerHTML = workingPosts.map((post, index) => `<article class="manage-item"><div><p class="post-meta">${post.dateLabel}</p><h3>${post.title}</h3><div class="post-tags">${post.tags.map((tag) => `<span>${tag}</span>`).join("")}</div></div><div class="manage-item-actions"><button type="button" data-edit="${index}">Edit</button><button type="button" data-delete="${index}">Delete</button></div></article>`).join("");
  }
  function resetForm() {
    form.reset(); form.elements.date.value = new Date().toISOString().slice(0, 10);
    editingIndex = null; picker.value = ""; saveButton.innerHTML = "Add post to top <span>↑</span>"; cancelButton.hidden = true; deleteCurrentButton.hidden = true;
  }
  function editPost(index) {
    const post = workingPosts[index]; editingIndex = index;
    form.elements.title.value = post.title; form.elements.date.value = post.date; form.elements.summary.value = post.summary; form.elements.tags.value = post.tags.join(", "); form.elements.cover.value = post.cover;
    form.elements.image.value = post.image || ""; form.elements.imageAlt.value = post.imageAlt || ""; form.elements.body.value = blocksToText(post.content);
    const link = post.content.find((block) => block.type === "link"); const unity = post.content.find((block) => block.type === "unity");
    saveButton.innerHTML = "Save changes <span>✓</span>"; cancelButton.hidden = false; deleteCurrentButton.hidden = false; picker.value = index; form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const post = formPost();
    if (!post.title || !post.summary || !form.elements.body.value.trim()) return;
    if (editingIndex === null) { workingPosts.unshift(post); copyNote.textContent = "New post added at the top of your list."; }
    else { workingPosts[editingIndex] = post; copyNote.textContent = "Post changes saved."; }
    savePosts(); render(); resetForm();
  });
  list.addEventListener("click", (event) => {
    const edit = event.target.closest("[data-edit]"); const remove = event.target.closest("[data-delete]");
    if (edit) editPost(Number(edit.dataset.edit));
    if (remove) { const index = Number(remove.dataset.delete); if (confirm(`Delete “${workingPosts[index].title}”?`)) { workingPosts.splice(index, 1); savePosts(); render(); copyNote.textContent = "Post deleted."; } }
  });
  picker.addEventListener("change", () => { if (picker.value === "") resetForm(); else editPost(Number(picker.value)); });
  deleteCurrentButton.addEventListener("click", () => { if (editingIndex !== null && confirm(`Delete “${workingPosts[editingIndex].title}”?`)) { workingPosts.splice(editingIndex, 1); savePosts(); render(); resetForm(); copyNote.textContent = "Post deleted."; } });
  cancelButton.addEventListener("click", resetForm);
  resetButton.addEventListener("click", () => { if (confirm("Reset this manager to the published posts? Any unexported changes will be removed.")) { workingPosts = JSON.parse(JSON.stringify(publishedPosts)); localStorage.removeItem(storageKey); render(); resetForm(); copyNote.textContent = "Reset to published posts."; } });
  copyButton.addEventListener("click", async () => { await navigator.clipboard.writeText(output.value); copyButton.textContent = "Copied!"; copyNote.textContent = "Copied. Replace the contents of posts-data.js with this text, then publish."; setTimeout(() => { copyButton.textContent = "Copy"; }, 1800); });
  downloadButton.addEventListener("click", () => { const blob = new Blob([output.value], { type: "text/javascript" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "posts-data.js"; link.click(); URL.revokeObjectURL(url); copyNote.textContent = "Downloaded posts-data.js. Replace the file in your project, then publish."; });
  const escapeHtml = (value) => String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const documentHead = (title, stylePath) => `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${escapeHtml(title)} — Pedas Terasi</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap" rel="stylesheet"><link rel="stylesheet" href="${stylePath}"></head>`;
  const staticTags = (post, extra = "") => `<div class="post-tags ${extra}">${post.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>`;
  const staticCover = (post) => post.image ? `<a class="post-cover is-image" href="posts/${encodeURIComponent(post.slug)}.html"><img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.imageAlt)}"></a>` : `<a class="post-cover cover-${escapeHtml(post.cover)}" href="posts/${encodeURIComponent(post.slug)}.html" aria-label="Read ${escapeHtml(post.title)}"></a>`;
  const staticCard = (post, index) => `<article class="post-card${index === 0 ? " featured" : ""}">${staticCover(post)}<div class="post-copy"><p class="post-meta"><time datetime="${escapeHtml(post.date)}">${escapeHtml(post.dateLabel)}</time></p>${staticTags(post)}<h3><a href="posts/${encodeURIComponent(post.slug)}.html">${escapeHtml(post.title)}</a></h3><p>${escapeHtml(post.summary)}</p><a class="read-link" href="posts/${encodeURIComponent(post.slug)}.html">Read note <span>→</span></a></div></article>`;
  const staticBlock = (block) => {
    if (block.type === "heading") return `<h2>${escapeHtml(block.text)}</h2>`;
    if (block.type === "quote") return `<blockquote><p>${escapeHtml(block.text)}</p></blockquote>`;
    if (block.type === "link") return `<p class="article-link"><a href="${escapeHtml(block.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(block.label)} <span aria-hidden="true">↗</span></a></p>`;
    if (block.type === "image") return `<figure class="article-image"><img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}" loading="lazy">${block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ""}</figure>`;
    if (block.type === "unity") return `<figure class="unity-demo"><iframe src="${escapeHtml(block.src)}" title="${escapeHtml(block.title || "Playable Unity game")}" loading="lazy">Your browser does not support embedded builds.</iframe>${block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ""}</figure>`;
    return `<p>${escapeHtml(block.text)}</p>`;
  };
  const staticPostNavigation = (index) => {
    const newer = workingPosts[index - 1]; const older = workingPosts[index + 1];
    const item = (entry, label) => entry ? `<a href="${encodeURIComponent(entry.slug)}.html"><span>${label}</span>${escapeHtml(entry.title)}</a>` : `<span class="nav-placeholder"></span>`;
    return `<nav class="post-navigation" aria-label="More notes">${item(newer, "Newer note")}${item(older, "Older note")}</nav>`;
  };
  const staticPostPage = (post, index) => `${documentHead(post.title, "../style.css")}<body class="post-page"><a class="skip-link" href="#article">Skip to note</a><header class="site-header"><div class="shell header-inner"><a class="brand" href="../"><span class="brand-mark">PT</span><span>Pedas Terasi</span></a><nav class="site-nav" aria-label="Main navigation"><a href="../">Home</a><a href="../#notes">All notes</a><a href="../#topics">Topics</a></nav></div></header><main><header class="post-header"><p class="post-meta"><time datetime="${escapeHtml(post.date)}">${escapeHtml(post.dateLabel)}</time></p>${staticTags(post, "post-header-tags")}<h1>${escapeHtml(post.title)}</h1><p class="post-deck">${escapeHtml(post.summary)}</p></header><article class="article" id="article">${post.content.map(staticBlock).join("")}<a class="back-link" href="../">← Back to all notes</a>${staticPostNavigation(index)}</article></main><footer class="site-footer"><div class="shell footer-inner"><p>Pedas Terasi</p><p>Made slowly, with curiosity. © 2026</p></div></footer></body></html>`;
  const staticIndexPage = () => `${documentHead("Notes on learning & making", "style.css")}<body><a class="skip-link" href="#notes">Skip to notes</a><header class="site-header"><div class="shell header-inner"><a class="brand" href="./"><span class="brand-mark">PT</span><span>Pedas Terasi</span></a><nav class="site-nav" aria-label="Main navigation"><a href="./" aria-current="page">Home</a><a href="#notes">All notes</a><a href="#topics">Topics</a></nav></div></header><main class="shell"><section class="welcome"><p class="eyebrow">Hello, welcome in</p><h1>A small place for things I’m learning.</h1><p>I write about making games, figuring things out, and the little moments that make the process worth remembering.</p></section><section class="topic-section" id="topics" aria-labelledby="topic-title"><p class="eyebrow" id="topic-title">Topics</p><div class="post-tags">${[...new Set(workingPosts.flatMap((post) => post.tags))].map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div></section><section class="post-list" id="notes" aria-labelledby="recent-title"><div class="list-heading"><h2 id="recent-title">All notes</h2><span>${workingPosts.length} notes</span></div>${workingPosts.map(staticCard).join("")}</section></main><footer class="site-footer"><div class="shell footer-inner"><p>Pedas Terasi</p><p>Made slowly, with curiosity. © 2026</p></div></footer></body></html>`;
  const writeTextFile = async (directory, name, text) => { const file = await directory.getFileHandle(name, { create: true }); const writer = await file.createWritable(); await writer.write(text); await writer.close(); };
  buildButton.addEventListener("click", async () => {
    if (!window.showDirectoryPicker) { copyNote.textContent = "This local browser does not support static building. Use Chrome or Edge, then open this page through a local server."; return; }
    try {
      buildButton.disabled = true; buildButton.textContent = "Building…"; savePosts();
      const root = await window.showDirectoryPicker({ mode: "readwrite" });
      const postsFolder = await root.getDirectoryHandle("posts", { create: true });
      await writeTextFile(root, "index.html", staticIndexPage());
      for (const [index, post] of workingPosts.entries()) await writeTextFile(postsFolder, `${post.slug}.html`, staticPostPage(post, index));
      await writeTextFile(root, "posts-data.js", exportText());
      copyNote.textContent = `Built ${workingPosts.length} static post pages and updated index.html in the selected folder. You can now upload that folder to GitHub.`;
    } catch (error) { if (error.name !== "AbortError") copyNote.textContent = "Could not write the files. Choose your website folder and allow write access."; }
    finally { buildButton.disabled = false; buildButton.textContent = "Build static HTML"; }
  });
  render();
})();