document.addEventListener("DOMContentLoaded", () => {
  const commentTriggerBtns = document.querySelectorAll(".comment-box-mld");
  const commentModalOverlay = document.getElementById("comment-modal-overlay");
  const commentModal = document.querySelector(".comment-mdl");
  const commentCloseBtn = document.querySelector(".comment-close-btn");
  const commentModalBody = document.querySelector(".comment-mdl-body");
  const scrollToTopBtn = document.querySelector(".scroll-to-top-btn");

  // Open modal on any trigger click
  commentTriggerBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      commentModalOverlay.classList.add("active");
      commentModal.classList.remove("closing");
      commentModalBody.scrollTop = 0;
    });
  });

  // Close modal with reverse animation
  function closeCommentModal() {
    commentModal.classList.add("closing");
    setTimeout(() => {
      commentModalOverlay.classList.remove("active");
      commentModal.classList.remove("closing");
    }, 300); // matches CSS animation duration
  }

  commentCloseBtn?.addEventListener("click", closeCommentModal);

  commentModalOverlay?.addEventListener("click", (e) => {
    if (e.target === commentModalOverlay) {
      closeCommentModal();
    }
  });

  // Show scroll-to-top button after scrolling 300px
  commentModalBody?.addEventListener("scroll", () => {
    if (commentModalBody.scrollTop > 300) {
      scrollToTopBtn?.classList.add("show");
    } else {
      scrollToTopBtn?.classList.remove("show");
    }
  });

  // Scroll to top on button click
  scrollToTopBtn?.addEventListener("click", () => {
    commentModalBody.scrollTo({ top: 0, behavior: "smooth" });
  });
});
