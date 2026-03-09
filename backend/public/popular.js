let sortMode = 'hot';
let timeFrame = 'today';

function parsePostDate(dateStr) { return new Date(dateStr); }

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
    const FREE_COUNT = typeof PostsComponent_Instance.getGuestFreePostCount === 'function'
        ? PostsComponent_Instance.getGuestFreePostCount()
        : 15;
    
    sortedPosts.forEach((post, index) => {
        const locked = !isLoggedIn && index >= FREE_COUNT;
        const article = PostsComponent_Instance.buildNewspaperArticle(post, index, locked, sortMode);
        postsContainer.appendChild(article);
    });
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
    const postsContainer = document.querySelector('.paper-grid');
    if (postsContainer) {
        postsContainer.onclick = (e) => {
            PostsComponent_Instance.handlePostAction(e, {
                onVote: () => renderPopularPosts()
            });
        };
    }

    initCustomSelects();
    renderPopularPosts();
});

// Expose render function globally for comment updates
window.triggerPostsUpdate = renderPopularPosts;