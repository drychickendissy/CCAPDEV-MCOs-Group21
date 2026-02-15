let sortMode = 'hot';
let timeFrame = 'today';

function parsePostDate(dateStr) { return new Date(dateStr); }

function escapeHtml(str) {
    return String(str == null ? "" : str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function prettyCategory(cat) {
    const c = String(cat || "").toLowerCase();
    if (c === "news") return "News";
    if (c === "help") return "Help";
    return "Discussion";
}

function openPostModal(postId) {
    const post = PostsComponent_Instance.getPostById(postId);
    if (!post) return;
    
    const user = PostsComponent_Instance.getUserById(post.authorId) || { username: "Unknown", photo: "assets/placeholder.png" };
    const score = (Number(post.upvotes) || 0) - (Number(post.downvotes) || 0);
    
    // Render full article in modal
    const modalContent = document.getElementById("modal-post-content");
    modalContent.innerHTML = 
        '<div class="post-author-header poppins-regular">' +
            '<img src="' + user.photo + '" alt="' + escapeHtml(user.username) + '" class="post-author-avatar">' +
            '<div class="post-author-info">' +
                '<span class="post-author-username poppins-extrabold">' + escapeHtml(user.username) + '</span>' +
                '<span class="post-author-date">' + escapeHtml(post.date) + (post.lastEdited ? ' &#8226; Edited ' + post.lastEdited : '') + '</span>' +
            '</div>' +
        '</div>' +
        '<h2 class="headline poppins-extrabold">' + escapeHtml(post.title) + '</h2>' +
        '<div class="section-row poppins-regular">' +
            (sortMode === 'top' ? 
                '<span>' + (Number(post.views) || 0) + ' Views &#8226; Score ' + score + '</span>' :
                '<span>' + (Number(post.views) || 0) + ' Views &#8226; &#9650; ' + (Number(post.upvotes) || 0) + ' &#9660; ' + (Number(post.downvotes) || 0) + '</span>') +
        '</div>' +
        '<div class="rule"></div>' +
        '<p class="excerpt poppins-regular">' + escapeHtml(post.content) + '</p>' +
        '<div class="tags-mini"><span>' + prettyCategory(post.category) + '</span></div>';
    
    // Render comments
    renderComments(post);
    
    // Show modal
    const modal = document.getElementById("post-view-modal");
    modal.style.display = "flex";
    modal.setAttribute("data-post-id", postId);
    
    // Close backdrop click
    const backdrop = modal.querySelector(".modal-backdrop");
    backdrop.onclick = function(e) {
        if (e.target === backdrop) {
            modal.style.display = "none";
        }
    };
}

function renderComments(post) {
    const comments = post.comments || [];
    const commentsList = document.getElementById("comments-list");
    const commentCount = document.getElementById("comment-count");
    
    commentCount.textContent = comments.length;
    commentsList.innerHTML = "";
    
    comments.forEach(function(comment) {
        const commentEl = document.createElement("div");
        commentEl.className = "comment-item";
        
        const user = PostsComponent_Instance.getUserById(comment.userId) || { username: "Unknown" };
        
        commentEl.innerHTML = 
            '<div class="comment-header poppins-regular">' +
                '<span class="comment-author poppins-extrabold">' + escapeHtml(user.username) + '</span>' +
                '<span class="comment-date">' + escapeHtml(comment.date || new Date().toLocaleDateString()) + '</span>' +
            '</div>' +
            '<p class="comment-text poppins-regular">' + escapeHtml(comment.text) + '</p>';
        
        commentsList.appendChild(commentEl);
    });
}

function closePostModal() {
    document.getElementById('post-view-modal').style.display = 'none';
}

// Logic to check timeframe for "Top" sorting
function isPostInTimeframe(post, timeframe) {
    const postDate = parsePostDate(post.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    postDate.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today - postDate) / (1000 * 60 * 60 * 24));
    
    switch(timeframe) {
        case 'today': return daysDiff === 0;
        case 'week': return daysDiff >= 0 && daysDiff < 7;
        case 'month': return daysDiff >= 0 && daysDiff < 30;
        case 'year': return daysDiff >= 0 && daysDiff < 365;
        case 'alltime': return true;
        default: return true;
    }
}

function getSortedPosts() {
    let posts = PostsComponent_Instance.getFilteredPosts({ sortBy: sortMode === 'top' ? 'top' : 'hot' });

    if (sortMode === 'top') {
        // Filter by timeframe and sort by highest score
        posts = posts.filter(post => isPostInTimeframe(post, timeFrame));
    }

    return posts;
}

function renderPopularPosts() {
    const postsContainer = document.querySelector('.paper-grid');
    const popularDate = document.getElementById('popularDate');
    if (!postsContainer) return;

    if (popularDate) {
        popularDate.textContent = new Date().toLocaleDateString("en-US", {
            weekday: "long", year: "numeric", month: "long", day: "numeric"
        });
    }

    postsContainer.innerHTML = '';
    const sortedPosts = getSortedPosts();
    const isLoggedIn = (localStorage.getItem("currentUserId") || "").trim().length > 0;
    const FREE_COUNT = 14; // 0-14 = 15 free posts
    
    sortedPosts.forEach((post, index) => {
        const locked = !isLoggedIn && index >= FREE_COUNT;
        const article = PostsComponent_Instance.buildNewspaperArticle(post, index, locked, sortMode);
        postsContainer.appendChild(article);
    });

    attachPostListeners();
}

function attachPostListeners() {
    // Vote Buttons
    document.querySelectorAll('.v-btn').forEach(btn => {
        btn.onclick = () => voteOnPost(btn.dataset.id, parseInt(btn.dataset.dir));
    });

    // Vote Buttons from shared component
    document.querySelectorAll('[data-action="up"], [data-action="down"]').forEach(btn => {
        if (btn.classList.contains('v-btn')) return; // Skip if already handled
        const action = btn.getAttribute('data-action');
        const postId = btn.getAttribute('data-id');
        if (action && postId) {
            btn.onclick = () => {
                PostsComponent_Instance.voteOnPost(postId, action);
                renderPopularPosts();
            };
        }
    });

    // Open and Comment Buttons 
    document.querySelectorAll('[data-action="open"], [data-action="comment"]').forEach(btn => {
        const postId = btn.getAttribute('data-id');
        if (postId) {
            btn.onclick = () => {
                const isLoggedIn = (localStorage.getItem("currentUserId") || "").trim().length > 0;
                const post = PostsComponent_Instance.getPostById(postId);
                const isLocked = post && post.locked;
                
                if (!isLoggedIn || isLocked) {
                    AlertModal.show("Please login or sign up to view and interact with posts.", "error");
                    return;
                }
                
                PostsComponent_Instance.incrementViewCount(postId);
                openPostModal(postId);
            };
        }
    });
}

function voteOnPost(postId, direction) {
    if (!localStorage.getItem("currentUserId")) {
        AlertModal.show("Please login to interact.", "error");
        return;
    }

    const directionMap = { 1: "up", "-1": "down" };
    const dir = String(direction);
    
    PostsComponent_Instance.voteOnPost(postId, directionMap[dir] || (direction > 0 ? "up" : "down"));
    renderPopularPosts();
}

// Custom Select initialization logic
function initCustomSelects() {
    const selects = document.querySelectorAll('.custom-select');
    selects.forEach(select => {
        const trigger = select.querySelector('.select-trigger');
        const options = select.querySelectorAll('.option');
        
        trigger.onclick = (e) => {
            e.stopPropagation();
            selects.forEach(s => { if(s !== select) s.classList.remove('open'); });
            select.classList.toggle('open');
        };

        options.forEach(option => {
            option.onclick = () => {
                const val = option.dataset.value;
                select.querySelector('.trigger-text').textContent = option.textContent;
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');

                if (select.id === 'sortSelect') {
                    sortMode = val;
                    document.getElementById('timeSelect').style.display = (val === 'top') ? 'block' : 'none';
                } else {
                    timeFrame = val;
                }
                renderPopularPosts();
            };
        });
    });
    window.onclick = () => selects.forEach(s => s.classList.remove('open'));
}

document.addEventListener('DOMContentLoaded', () => {
    initCustomSelects();
    renderPopularPosts();
    
    // Comment submission
    const submitBtn = document.getElementById("submit-comment-btn");
    if (submitBtn) {
        submitBtn.onclick = function() {
            const modal = document.getElementById("post-view-modal");
            const postId = modal.getAttribute("data-post-id");
            const commentText = document.getElementById("comment-input").value.trim();
            const currentUserId = (localStorage.getItem("currentUserId") || "").trim();
            
            if (!currentUserId) {
                AlertModal.show("Please login to add comments.", "error");
                return;
            }
            
            if (!commentText) {
                AlertModal.show("Comment cannot be empty.", "error");
                return;
            }
            
            const post = PostsComponent_Instance.getPostById(postId);
            if (!post) return;
            
            // Add comment to post
            post.comments = post.comments || [];
            post.comments.push({
                userId: currentUserId,
                text: commentText,
                date: new Date().toLocaleDateString()
            });
            
            // Save to localStorage
            localStorage.setItem('mockDatabase', JSON.stringify(PostsComponent_Instance.getDatabase()));
            
            // Clear input and re-render
            document.getElementById("comment-input").value = "";
            renderComments(post);
            AlertModal.show("Comment posted!", "success");
        };
    }
});