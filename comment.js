// Enhanced comment system with reply counts
const commentBox = document.querySelector('.comment-box');
const textarea = commentBox.querySelector('textarea');
const charCounter = commentBox.querySelector('.char-counter');
const submitBtn = commentBox.querySelector('.submit-btn');
const commentsSection = commentBox.querySelector('.comments-section');
const commentCountEl = commentBox.querySelector('.comment-count');
const sortSelect = commentBox.querySelector('select');
const nameInput = commentBox.querySelector('.name-input');
const emailInput = commentBox.querySelector('.email-input');
const REPLY_PARENT_ID = commentBox.querySelector('.reply-parent-id');
const REPLY_IMMEDIATE_ID = commentBox.querySelector('.reply-immediate-id');
let REPLY_TO_NAME = '';
let MENTION_PREFIX = '';

const MAX_CHARS = 500;
const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 15;
const topic = window.location.pathname.split('/').pop() || 'default';
let isAdmin = false;
// Initialize event listeners
textarea.addEventListener('input', updateCharCounter);
submitBtn.addEventListener('click', submitComment);
sortSelect.addEventListener('change', () => fetchComments(sortSelect.value));
textarea.addEventListener('keydown', handleBackspace);
nameInput.addEventListener('input', handleNameInput);
nameInput.addEventListener('blur', validateName);

// Initial setup
fetchComments(sortSelect.value || 'desc');

let badWords = [];

fetch('/json/profanity.json')
  .then(res => res.json())
  .then(data => {
    badWords = data.map(word => word.toLowerCase());
  })
  .catch(err => console.error('Failed to load profanity.json:', err));

function handleNameInput(e) {
  
  const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
  e.target.value = value;
  
 
  clearTimeout(nameInput.validationTimer);
  nameInput.validationTimer = setTimeout(validateName, 500);
}


function validateName() {
  // Skip validation for admins
  if (isAdmin) {
    nameInput.style.borderColor = '';
    const warning = document.getElementById('name-warning');
    if (warning) warning.remove();
    return true;
  }

  const name = nameInput.value.trim();
  let warningMessage = '';

  // Check if name is empty
  if (!name) {
    warningMessage = 'Please enter your first name';
  }
  // Check name length
  else if (name.length < MIN_NAME_LENGTH) {
    warningMessage = `Name must be at least ${MIN_NAME_LENGTH} characters`;
  }
  else if (name.length > MAX_NAME_LENGTH) {
    warningMessage = `Name must be no more than ${MAX_NAME_LENGTH} characters`;
  }
  // Check for multiple words
  else if (name.split(/\s+/).length > 1) {
    const firstName = name.split(/\s+/)[0];
    const surname = name.substring(firstName.length).trim();
    warningMessage = `Please use only your first name (e.g., "${firstName}") - no surnames like "${surname}"`;
  }
  // Check for profanity
  else if (badWords.some(word => name.toLowerCase().includes(word.toLowerCase()))) {
    warningMessage = 'Please use appropriate language in your name';
  }

if (warningMessage) {
  nameInput.style.borderColor = 'red';
  if (!document.getElementById('name-warning')) {
    const warning = document.createElement('div');
    warning.id = 'name-warning';
    warning.style.color = 'red';
    warning.style.marginTop = '5px';
    warning.style.fontSize = '0.8em';
    warning.style.lineHeight = '1.2';
    nameInput.closest('.input-wrapper').appendChild(warning);
  }
  document.getElementById('name-warning').textContent = warningMessage;
  return false;


  } else {
    nameInput.style.borderColor = '';
    const warning = document.getElementById('name-warning');
    if (warning) warning.remove();
    return true;
  }
}
function updateCharCounter() {
  const remaining = MAX_CHARS - textarea.value.length;
  charCounter.textContent = `${textarea.value.length} / ${MAX_CHARS}`;
  charCounter.style.color = remaining < 0 ? 'red' : '';
  
  if (textarea.value.trim() === '' && REPLY_TO_NAME) {
    clearReply();
  }
}

function resetCharCounter() {
  charCounter.textContent = `0 / ${MAX_CHARS}`;
  charCounter.style.color = '';
}

function maskProfanity(text) {
  let maskedText = text;
  badWords.forEach(word => {
    const safeWord = word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${safeWord}\\b`, 'gi');
    maskedText = maskedText.replace(regex, match => '*'.repeat(match.length));
  });

  return maskedText;
}

// Fix the typo in clearReply function
function clearReply() {
  REPLY_PARENT_ID.value = '';  // Fixed typo here
  REPLY_IMMEDIATE_ID.value = '';
  REPLY_TO_NAME = '';
  MENTION_PREFIX = '';
  textarea.placeholder = 'Write your comment here...';
}
function handleBackspace(e) {
  if (e.key === 'Backspace' && REPLY_TO_NAME) {
    const text = textarea.value;
    const cursorPos = textarea.selectionStart;
    
    if (cursorPos <= MENTION_PREFIX.length && 
        text.startsWith(MENTION_PREFIX.substring(0, cursorPos))) {
      clearReply();
    }
  }
}

function submitComment() {
  let message = textarea.value.trim();
  const name = nameInput.value.trim();

  // Validate name (skip for admins)
  if (!isAdmin) {
   if (!name) {
  nameInput.focus();
  VanillaToasts.create({
    title: 'Missing Name',
    text: 'Please enter your first name.',
    type: 'warning',
    timeout: 3000,
    positionClass: 'bottomLeft'
    
  });
  return;
}

    if (!validateName()) {
      nameInput.focus();
      return;
    }
  }
  if (REPLY_TO_NAME) {
    message = message.replace(new RegExp(`^@${REPLY_TO_NAME}\\s*`), '').trim();
  }

  if (!message) {
  VanillaToasts.create({
    title: 'Empty Comment',
    text: 'Please enter a comment before posting.',
    type: 'warning',
    timeout: 4000
  });
  return;
}

  if (message.length > MAX_CHARS) {
  VanillaToasts.create({
    title: 'Too Long',
    text: `Comment exceeds the ${MAX_CHARS}-character limit.`,
    type: 'error',
    timeout: 4000
  });
  return;
}


  message = maskProfanity(message);

  const formData = new URLSearchParams();
  formData.append('topic', topic);
  formData.append('name', name);
  formData.append('message', message);
  formData.append('parentId', REPLY_PARENT_ID.value || '');
  formData.append('immediateId', REPLY_IMMEDIATE_ID.value || '');
  formData.append('isReply', REPLY_PARENT_ID.value ? 'true' : 'false');
  formData.append('replyToName', REPLY_TO_NAME || '');
  formData.append('email', emailInput.value.trim());

  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span class="spinner"></span> Posting...`;

  fetch('ADD_YOUR_OWN_GOOGLE_APS_SCRIPT_URL_HERE', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: formData.toString(),
  })
  .then(res => res.json())
.then(data => {
  if (data.success) {
    isAdmin = data.isAdmin === true || data.isAdmin === 'true';


    if (isAdmin) {
      nameInput.classList.add('verified');
    }

    textarea.value = '';
    nameInput.value = '';
    emailInput.value = '';
    resetCharCounter();
    clearReply();
    fetchComments(sortSelect.value);
  } else {
    VanillaToasts.create({
  title: 'Post Failed',
  text: `Error: ${data.error || 'Unknown error'}`,
  type: 'error',
  timeout: 5000
});

  }
})
    .catch(err => {
  VanillaToasts.create({
    title: 'Network Error',
    text: err.message,
    type: 'error',
    timeout: 5000
  });
})

    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Post';
    });
}


function fetchComments(order = 'desc') {
  // Generate multiple shimmer placeholders
  commentsSection.innerHTML = Array(3).fill(`
    <div class="skeletoncom">
      <div class="skeletoncom-circle"></div>
      <div class="skeletoncom-lines">
        <div class="skeletoncom-line medium"></div>
        <div class="skeletoncom-line short"></div>
      </div>
    </div>
  `).join('');

  fetch(`ADD_YOUR_OWN_GOOGLE_APS_SCRIPT_URL_HERE?topic=${encodeURIComponent(topic)}`)
    .then(res => res.json())
    .then(data => {
      if (!Array.isArray(data)) {
        commentsSection.innerHTML = 'Failed to load comments.';
        return;
      }

      data.sort((a, b) => order === 'asc' ? a.sortIndex - b.sortIndex : b.sortIndex - a.sortIndex);

      const commentMap = new Map();
      data.forEach(c => commentMap.set(c.sortIndex, { ...c, replies: [] }));

      data.forEach(c => {
        if (c.isReply && c.parentId) {
          const parent = commentMap.get(Number(c.parentId));
          if (parent) parent.replies.push(c);
        }
      });

      const rootComments = Array.from(commentMap.values()).filter(c => !c.isReply || !c.parentId);

      // Update all comment counters on page
      document.querySelectorAll('.comment-count').forEach(el => {
        el.textContent = data.length;
      });

      renderComments(rootComments);
    })
    .catch(() => {
      commentsSection.innerHTML = 'Failed to load comments.';
    });
}


function renderComments(comments) {
  commentsSection.innerHTML = '';
  comments.forEach(c => {
    const commentEl = createCommentElement(c);
    commentsSection.appendChild(commentEl);
  });
}

function createCommentElement(comment) {
  const div = document.createElement('div');
  div.classList.add('comment');
  if (comment.isReply === 'true' || comment.isReply === true) {
    div.classList.add('reply');
  }

  // Header with avatar and user info
  const header = document.createElement('div');
  header.classList.add('comment-header');
  
  const avatar = document.createElement('div');
  avatar.classList.add('comment-avatar');
  
  // Check if user is admin
  const isAdminUser = comment.isAdmin === true || comment.isAdmin === 'true';
  
  if (isAdminUser) {
  // Admin gets a static avatar image instead of Initial CHANGE WHAT IMAGE YOU LIKE AS YOURSELF (ADMIN)
  avatar.innerHTML = '<img src="ADMIN_IMG_URL_HERE" class="comment-avatar" alt="Admin Avatar">';

  } else {
    // Regular user gets initials avatar
    avatar.innerHTML = `
      <div style="
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: ${stringToColor(comment.name || 'Anonymous')};
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        font-size: 18px;
      ">
        ${getInitials(comment.name || 'A')}
      </div>
    `;
  }
  
  header.appendChild(avatar);

  const userDiv = document.createElement('div');
  userDiv.classList.add('comment-user');
  userDiv.innerHTML = `
    <strong>
      ${escapeHtml(comment.name)}
      ${isAdminUser ? '<i class="fas fa-check-circle verified-badge" title="Verified"></i>' : ''}
    </strong>
    <span class="time">${formatDate(comment.sortIndex)}</span>
  `;
  header.appendChild(userDiv);
  div.appendChild(header);

  // Comment content
  const contentDiv = document.createElement('div');
  contentDiv.classList.add('comment-content');
  const p = document.createElement('p');

  if (comment.isReply === 'true' || comment.isReply === true) {
    const mentionSpan = document.createElement('span');
    mentionSpan.classList.add('mention');
    mentionSpan.textContent = `@${escapeHtml(comment.replyToName || 'Unknown')}`;
    p.appendChild(mentionSpan);
    p.appendChild(document.createTextNode(' ' + escapeHtml(comment.message)));
  } else {
    p.textContent = escapeHtml(comment.message);
  }

  contentDiv.appendChild(p);
  div.appendChild(contentDiv);

  // Button container for Reply and Show/Hide
  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('comment-btn-container');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.gap = '15px';
  buttonContainer.style.alignItems = 'center';
  buttonContainer.style.marginTop = '10px';

  // Reply button
  const replyBtn = document.createElement('button');
  replyBtn.classList.add('reply-btn');
  replyBtn.innerHTML = '<i class="fas fa-reply"></i> Reply';
  replyBtn.addEventListener('click', () => {
    REPLY_PARENT_ID.value = comment.parentId || comment.sortIndex;
    REPLY_IMMEDIATE_ID.value = comment.sortIndex;
    REPLY_TO_NAME = comment.name;
    MENTION_PREFIX = `@${comment.name}`;
    textarea.focus();
    textarea.placeholder = `Replying to @${comment.name}...`;
    textarea.value = MENTION_PREFIX + ' ';
    textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
  });

  buttonContainer.appendChild(replyBtn);

  // Replies toggle if needed
  if (comment.replies?.length > 0) {
    const repliesContainer = document.createElement('div');
    repliesContainer.classList.add('replies');
    repliesContainer.style.display = 'none';
    
    comment.replies.forEach(reply => {
      repliesContainer.appendChild(createCommentElement(reply));
    });

    const toggleBtn = document.createElement('button');
    toggleBtn.classList.add('toggle-replies-btn');
    toggleBtn.innerHTML = `<i class="fas fa-comments"></i> <span>Show Replies (${comment.replies.length})</span>`;
    toggleBtn.addEventListener('click', () => {
      const isHidden = repliesContainer.style.display === 'none';
      repliesContainer.style.display = isHidden ? 'block' : 'none';
      toggleBtn.querySelector('span').textContent = 
        isHidden ? `Hide Replies (${comment.replies.length})` : `Show Replies (${comment.replies.length})`;
    });

    buttonContainer.appendChild(toggleBtn);
    div.appendChild(buttonContainer);
    div.appendChild(repliesContainer);
  } else {
    div.appendChild(buttonContainer);
  }

  return div;
}
// Helper functions
function getInitials(name) {
  const names = name.trim().split(' ');
  return names.length === 1 
    ? names[0].charAt(0).toUpperCase()
    : (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 60%, 70%)`;
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
    
}
