(function () {
  const postList = (() => { try { const saved = JSON.parse(localStorage.getItem("pedas-terasi-post-manager")); return Array.isArray(saved) ? saved : posts; } catch { return posts; } })();
  const postUrl = (post) => `posts/post.html?post=${encodeURIComponent(post.slug)}`;
  const cover = (post) => post.image ? `<a class="post-cover is-image" href="${postUrl(post)}" aria-label="Read ${post.title}"><img src="${post.image}" alt="${post.imageAlt || ""}"></a>` : `<a class="post-cover cover-${post.cover}" href="${postUrl(post)}" aria-label="Read ${post.title}"></a>`;
  const card = (post, index) => `
    <article class="post-card${index === 0 ? " featured" : ""}">
      ${cover(post)}
      <div class="post-copy">
        <p class="post-meta"><time datetime="${post.date}">${post.dateLabel}</time></p>
        <div class="post-tags">${post.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
        <h3><a href="${postUrl(post)}">${post.title}</a></h3>
        <p>${post.summary}</p>
        <a class="read-link" href="${postUrl(post)}">Read note <span>→</span></a>
      </div>
    </article>`;

  const list = document.querySelector("[data-post-list]");
  const filters = document.querySelector("[data-tag-filters]");
  const count = document.querySelector("[data-note-count]");
  if (!list || !filters) return;

  const tags = [...new Set(postList.flatMap((post) => post.tags))];
  let activeTag = "All";
  const render = () => {
    const visiblePosts = activeTag === "All" ? postList : postList.filter((post) => post.tags.includes(activeTag));
    list.innerHTML = visiblePosts.map(card).join("") || `<p class="empty-state">No notes here yet.</p>`;
    count.textContent = activeTag === "All" ? `${postList.length} notes` : `${visiblePosts.length} note${visiblePosts.length === 1 ? "" : "s"} · ${activeTag}`;
    filters.querySelectorAll("button").forEach((button) => {
      const selected = button.dataset.tag === activeTag;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", selected);
    });
  };

  filters.innerHTML = ["All", ...tags].map((tag) => `<button type="button" data-tag="${tag}">${tag}</button>`).join("");
  filters.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-tag]");
    if (!button) return;
    activeTag = button.dataset.tag;
    render();
    document.querySelector("#notes").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  render();
})();