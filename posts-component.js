/**
 * Reusable Posts Component
 * Provides unified post rendering, voting, and view tracking across all pages
 */

class PostsComponent {
    constructor() {
        // First, try to load from localStorage if it exists
        const saved = localStorage.getItem('mockDatabase');
        if (saved) {
            try {
                this.mockDatabase = JSON.parse(saved);
                return;
            } catch (e) {
                // If parse fails, fall back to default
            }
        }
        
        // Use the global mockDatabase from data.js (which has the defaults)
        this.mockDatabase = typeof window.mockDatabase !== 'undefined' ? window.mockDatabase : {};
        
        // Initialize localStorage with current mockDatabase
        localStorage.setItem('mockDatabase', JSON.stringify(this.mockDatabase));
    }

    /**
     * Get current database (always from in-memory mockDatabase which is synced with localStorage)
     */
    getDatabase() {
        return this.mockDatabase;
    }

    /**
     * Get user by ID
     */
    getUserById(userId) {
        const db = this.getDatabase();
        return db.users ? db.users.find(u => u.id === userId) : null;
    }

    /**
     * Get post by ID
     */
    getPostById(postId) {
        const db = this.getDatabase();
        return db.posts ? db.posts.find(p => p.id === postId) : null;
    }

    /**
     * Build a newspaper-style article element (used by Discover and Popular)
     */
    buildNewspaperArticle(post, index, locked = false, displayMode = 'default') {
        function escapeHtml(str) {
            return String(str == null ? "" : str)
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
                .replaceAll('"', "&quot;")
                .replaceAll("'", "&#039;");
        }

        function excerpt(text, n) {
            var t = String(text || "").trim().replace(/\s+/g, " ");
            if (t.length <= n) return t;
            return t.slice(0, n).trim() + "…";
        }

        function prettyCategory(cat) {
            var c = String(cat || "").toLowerCase();
            if (c === "news") return "News";
            if (c === "help") return "Help";
            return "Discussion";
        }

        const score = (Number(post.upvotes) || 0) - (Number(post.downvotes) || 0);
        const user = this.getUserById(post.authorId) || { username: "Unknown", photo: "assets/placeholder.png" };

        const el = document.createElement("article");
        el.className = "article" + (locked ? " locked" : "");
        el.setAttribute("data-locked", locked ? "1" : "0");
        el.setAttribute("data-id", post.id);
        el.setAttribute("data-category", String(post.category).toLowerCase());

        // For "top" display mode, show only the score
        const statsDisplay = displayMode === 'top' ? 
            '<span>' + (Number(post.views) || 0) + ' Views &#8226; Score ' + score + '</span>' :
            '<span>' + (Number(post.views) || 0) + ' Views &#8226; &#9650; ' + (Number(post.upvotes) || 0) + ' &#9660; ' + (Number(post.downvotes) || 0) + '</span>';

        el.innerHTML =
            '<div class="post-author-header poppins-regular">' +
                '<img src="' + user.photo + '" alt="' + escapeHtml(user.username) + '" class="post-author-avatar">' +
                '<div class="post-author-info">' +
                    '<span class="post-author-username poppins-extrabold">' + escapeHtml(user.username) + '</span>' +
                    '<span class="post-author-date">' + escapeHtml(post.date) + (post.lastEdited ? ' &#8226; Edited ' + post.lastEdited : '') + '</span>' +
                '</div>' +
            '</div>' +
            '<h2 class="headline poppins-extrabold">' + escapeHtml(post.title) + '</h2>' +
            '<div class="section-row poppins-regular">' +
                statsDisplay +
            '</div>' +
            '<div class="rule"></div>' +
            '<p class="excerpt poppins-regular">' + escapeHtml(excerpt(post.content, 140)) + '</p>' +
            '<div class="tags-mini"><span>' + prettyCategory(post.category) + '</span></div>' +
            '<div class="article-actions">' +
                '<div class="vote">' +
                    '<button type="button" data-action="up" data-id="' + post.id + '">&#9650</button>' +
                    '<button type="button" data-action="down" data-id="' + post.id + '">&#9660</button>' +
                '</div>' +
                '<div class="comment-view-actions">' +
                    '<button class="comment-btn" type="button" data-action="comment" data-id="' + post.id + '">&#128172; ' + (Number(post.comments?.length) || 0) + '</button>' +
                    '<button class="open-btn" type="button" data-action="open" data-id="' + post.id + '">View</button>' +
                '</div>' +
            '</div>';

        return el;
    }

    /**
     * Build a card-style post element (used by Profile)
     */
    buildCardPost(post) {
        function escapeHtml(str) {
            return String(str == null ? "" : str)
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
                .replaceAll('"', "&quot;")
                .replaceAll("'", "&#039;");
        }

        const user = this.getUserById(post.authorId) || { username: "Unknown" };
        const score = (Number(post.upvotes) || 0) - (Number(post.downvotes) || 0);

        const div = document.createElement("div");
        div.className = "profile-post card card--light";
        div.setAttribute("data-id", post.id);

        div.innerHTML =
            '<div class="post-header-with-menu">' +
                '<div class="section-row poppins-regular">' +
                    '<span>' + (Number(post.views) || 0) + ' views</span>' +
                '</div>' +
                '<div class="post-menu-container">' +
                    '<button class="post-menu-btn" data-id="' + post.id + '">&#8942;</button>' +
                    '<div class="post-menu-dropdown" data-id="' + post.id + '" style="display: none;">' +
                        '<button class="post-menu-item post-edit-btn" data-id="' + post.id + '">Edit</button>' +
                        '<button class="post-menu-item post-delete-btn" data-id="' + post.id + '">Delete</button>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<h2 class="headline poppins-extrabold">' + escapeHtml(post.title) + '</h2>' +
            '<div class="byline poppins-regular">Posted on ' + escapeHtml(post.date) + (post.lastEdited ? ' &#8226; Edited ' + post.lastEdited : '') + '</div>' +
            '<div class="rule"></div>' +
            '<p class="excerpt poppins-regular">' + escapeHtml(post.content) + '</p>' +
            '<div class="article-actions">' +
                '<span class="chip poppins-regular">Score: ' + score + '</span>' +
                '<div class="vote">' +
                    '<button type="button" data-action="up" data-id="' + post.id + '">&#9650;</button>' +
                    '<button type="button" data-action="down" data-id="' + post.id + '">&#9660;</button>' +
                '</div>' +
            '</div>';

        return div;
    }

    /**
     * Handle voting on a post
     */
    voteOnPost(postId, direction) {
        if (!localStorage.getItem("currentUserId")) {
            if (typeof AlertModal !== 'undefined') {
                AlertModal.show("Please login to interact.", "error");
            }
            return;
        }

        const currentUserId = localStorage.getItem("currentUserId");
        const post = this.getPostById(postId);

        if (!post) return;

        post.votes = post.votes || {};
        const prev = post.votes[currentUserId] || null;
        const next = (prev === direction) ? null : direction;

        if (prev === "up") post.upvotes--;
        if (prev === "down") post.downvotes--;

        if (next === "up") post.upvotes++;
        if (next === "down") post.downvotes++;

        if (next) {
            post.votes[currentUserId] = next;
            post.lastInteraction = Date.now();
        } else {
            delete post.votes[currentUserId];
        }

        // Save to localStorage to persist changes
        localStorage.setItem('mockDatabase', JSON.stringify(this.mockDatabase));

        if (typeof AlertModal !== 'undefined') {
            AlertModal.show("Vote updated!", "success");
        }
    }

    /**
     * Increment view count for a post
     */
    incrementViewCount(postId) {
        const post = this.getPostById(postId);

        if (post) {
            post.views = (Number(post.views) || 0) + 1;
            // Save to localStorage to persist changes
            localStorage.setItem('mockDatabase', JSON.stringify(this.mockDatabase));
        }
    }

    /**
     * Edit a post
     */
    editPost(postId, newTitle, newContent) {
        const post = this.getPostById(postId);

        if (post) {
            post.title = newTitle;
            post.content = newContent;
            post.lastEdited = new Date().toLocaleString();
            // Save to localStorage to persist changes
            localStorage.setItem('mockDatabase', JSON.stringify(this.mockDatabase));
            return true;
        }
        return false;
    }

    /**
     * Get filtered and sorted posts
     */
    getFilteredPosts(options = {}) {
        const db = this.getDatabase();
        const posts = db.posts ? [...db.posts] : [];

        const {
            sortBy = 'recent', // recent, hot, top, trending
            filterCategory = null,
            filterAuthor = null,
            limit = null
        } = options;

        let filtered = posts;

        // Apply category filter
        if (filterCategory) {
            filtered = filtered.filter(p => p.category.toLowerCase() === filterCategory.toLowerCase());
        }

        // Apply author filter
        if (filterAuthor) {
            filtered = filtered.filter(p => p.authorId === filterAuthor);
        }

        // Apply sorting
        switch (sortBy) {
            case 'hot':
                filtered.sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0));
                break;
            case 'trending':
                filtered.sort((a, b) => {
                    const scoreA = (Number(a.upvotes) || 0) - (Number(a.downvotes) || 0);
                    const scoreB = (Number(b.upvotes) || 0) - (Number(b.downvotes) || 0);
                    return scoreB - scoreA;
                });
                break;
            case 'top':
                filtered.sort((a, b) => {
                    const scoreA = (Number(a.upvotes) || 0) - (Number(a.downvotes) || 0);
                    const scoreB = (Number(b.upvotes) || 0) - (Number(b.downvotes) || 0);
                    return scoreB - scoreA;
                });
                break;
            case 'recent':
            default:
                filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
        }

        // Apply limit
        if (limit) {
            filtered = filtered.slice(0, limit);
        }

        return filtered;
    }
}

// Create global instance
const PostsComponent_Instance = new PostsComponent();

/**
 * Centralized modal functions for consistency across all pages
 */

window.openPostModal = function(postId) {
    const post = PostsComponent_Instance.getPostById(postId);
    if (!post) return;
    
    const user = PostsComponent_Instance.getUserById(post.authorId) || { username: "Unknown", photo: "assets/placeholder.png" };
    const score = (Number(post.upvotes) || 0) - (Number(post.downvotes) || 0);
    
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

    // Render full article in modal
    const modalContent = document.getElementById("modal-post-content");
    if (!modalContent) return;
    
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
            '<span>' + (Number(post.views) || 0) + ' Views &#8226; &#9650; ' + (Number(post.upvotes) || 0) + ' &#9660; ' + (Number(post.downvotes) || 0) + '</span>' +
        '</div>' +
        '<div class="rule"></div>' +
        '<p class="excerpt poppins-regular">' + escapeHtml(post.content) + '</p>' +
        '<div class="tags-mini"><span>' + prettyCategory(post.category) + '</span></div>';
    
    // Render comments
    window.renderComments(post);
    
    // Show modal
    const modal = document.getElementById("post-view-modal");
    if (!modal) return;
    modal.style.display = "flex";
    modal.setAttribute("data-post-id", postId);
    
    // Close backdrop click
    const backdrop = modal.querySelector(".modal-backdrop");
    if (backdrop) {
        backdrop.onclick = function(e) {
            if (e.target === backdrop) {
                modal.style.display = "none";
            }
        };
    }
};

window.renderComments = function(post) {
    const comments = post.comments || [];
    const commentsList = document.getElementById("comments-list");
    const commentCount = document.getElementById("comment-count");
    
    if (!commentsList || !commentCount) return;
    
    function escapeHtml(str) {
        return String(str == null ? "" : str)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
    
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
};

window.closePostModal = function() {
    const modal = document.getElementById('post-view-modal');
    if (modal) {
        modal.style.display = 'none';
    }
};
