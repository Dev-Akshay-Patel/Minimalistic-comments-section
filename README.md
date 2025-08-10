# Minimalistic Comment System

A **minimal**, **secure**, and **lightweight** comment system that packs a punch without unnecessary tech overhead.  
Designed for **blogs, articles, and web pages** — with simple Google Sheets integration to store and manage comments per page.
## Demo: [Comment Trigger Button Available on Top and Bottom (Join the converstion) You have to scroll little bit](https://bitwisestudy.web.app/notes/class12/chemistry/haloalkanes-haloarenes-notes-class-12)

---

## ✨ Features

### 🪶 Minimal & Lightweight
- Extremely small footprint — **lighter than aerosol**.
- Uses very **low technology** for maximum compatibility.
- Simple to integrate into **any page** via HTML snippet.

### 🔒 Security & Protection
- **Blocks offensive/profane language** (supports **Hindi** + **English** out of the box).
- Add your **own custom profanity list** (even local/mother tongue).
- **Regex word blocking** for flexible filtering.
- **Name moderation**: Blocks eerie, unfamiliar, or inappropriate names.
- **XSS attack prevention** (client-side and backend).
- **Backend protection** for expert-level bypass attempts.

### 👨‍💼 Admin Features
- **Admin blue tick** for verified comments (helps users identify you).
- Delete comments directly from **Google Sheets**.
- Sort comments easily within Sheets for quick moderation.
- Edit **maximum character length** for messages.
- **Edit profile display** for admin (users get name initials only, no profile pics).

### 💬 Comment System
- **No threaded replies** (linear view).
- Supports **unlimited number of comments**.
- **Time stamps** on all comments.
- **Sorting**: Show latest or oldest first.
- Profanity masking using `*` characters.
- **Name initials** instead of profile pictures for simplicity.

### 📄 Per-Page Comment Storage
- Comments are stored **separately per page** in Google Sheets.
- Example:  
  - Comments from `page1.html` → stored in `page1` sheet.  
  - Keeps comments **organized** and prevents bloating/mixing.

### ⚡ User Experience
- **Shimmer/Skeleton loader** (3 placeholders) instead of spinners for a modern feel.
- **Scroll-up feature** when comment section becomes too large.
- Fully functional without relying on heavy frameworks.

---

## 🚀 How It Works
1. **Embed** the provided HTML snippet into your page (e.g., blog posts).
2. The system automatically associates comments with the **page name or URL**.
3. **Google Sheets** acts as your database for comment storage and admin controls.
4. **Profanity filters**, **XSS prevention**, and **backend checks** keep things safe.
5. Admins can log in, manage comments, and adjust settings.

---

## 🌐 Language Support
- **Hindi** and **English** profanity blocking out of the box.
- Add any **custom language or regional words** to expand detection.

---

## 🛠 Customization
- Change **max characters per comment**.
- Add **custom profanity words**.
- Modify **sorting behavior** (latest first or oldest first).
- Adjust **profile display** for admin.

---

## 📦 Requirements
- A **Google Sheet** set up for comment storage.
- Basic HTML knowledge for embedding.
- Browser with JavaScript enabled.

---

## 📜 License
Licensed under the **Apache License 2.0** — free for use in open or closed-source projects, but attribution is required.

