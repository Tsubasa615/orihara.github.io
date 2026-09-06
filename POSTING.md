# Posting a new note

You can also edit **`posts-data.js`** directly.

1. Copy one complete post block inside the `posts` list.
2. Paste it at the very top, under `const posts = [`.
3. Change `slug`, `date`, `dateLabel`, `tags`, `title`, `summary`, and `cover`.
4. Write the article inside `content`.
5. Save and publish. The new note appears at the top of the homepage automatically.

## Optional post-card image

By default, a post uses one of the illustrated covers (`one`, `two`, `three`, or `four`). To use your own image on the homepage instead, add these optional fields below `cover`:

```js
cover: "one", // used only when no image is set
image: "images/my-first-game.jpg",
imageAlt: "A small character standing in a green field",
```

Put your image in an `images` folder at the top of the website. If you leave out `image`, the illustrated cover stays in place.
## Putting content inside the note body

In Post Maker, put these on their own line wherever you want them to appear in the note. Leave a blank line before and after each one.

```text
[image: ../images/my-game.jpg | A character walking through a forest | Early forest test]

[link: See the game page | https://example.com]

[unity: ../games/my-first-game/index.html | My first playable game | Use arrow keys to move.]
```

The image, link, or Unity game will appear in that exact position between your paragraphs.
## Content types you can use

### Normal paragraph

```js
{ type: "p", text: "Write your paragraph here." }
```

### Small heading

```js
{ type: "heading", text: "What surprised me" }
```

### Highlighted quote

```js
{ type: "quote", text: "A short memorable line goes here." }
```

### A link

This opens the link in a new tab.

```js
{
  type: "link",
  label: "See the game that inspired me",
  url: "https://example.com"
}
```

### Unity WebGL build

First export your Unity WebGL project into a folder in this website, for example:

```
games/my-first-game/index.html
```

Then add this block to the post. Because the article page lives in `posts/`, use `../` before `games/`.

```js
{
  type: "unity",
  src: "../games/my-first-game/index.html",
  title: "My first playable game",
  caption: "Use arrow keys to move. This is an early build!"
}
```

It will appear as a playable game directly inside your post.

## Full post example

```js
{
  slug: "first-game-jam",
  date: "2026-09-10",
  dateLabel: "10 Sep 2026",
  tags: ["Game dev", "Unity"],
  title: "What I learned from my first game jam",
  summary: "A short note about making something in a weekend.",
  cover: "one",
  content: [
    { type: "p", text: "Write your first paragraph here." },
    { type: "link", label: "See the jam page", url: "https://example.com" },
    { type: "heading", text: "What surprised me" },
    { type: "p", text: "Write the next paragraph here." },
    {
      type: "unity",
      src: "../games/my-first-game/index.html",
      title: "My first playable game",
      caption: "Try the early build here."
    }
  ]
},
```
