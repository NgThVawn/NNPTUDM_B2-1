//HTTP request Get,post,put,delete
async function Load() {
    try {
        let res = await fetch('http://localhost:3000/posts')
        let data = await res.json();
        let body = document.getElementById("table-body");
        body.innerHTML = "";
        
        let totalPosts = data.length;
        let activePosts = data.filter(p => !p.isDeleted).length;
        let deletedPosts = data.filter(p => p.isDeleted).length;
        
        document.getElementById("posts-count").textContent = totalPosts;
        document.getElementById("posts-active").textContent = activePosts;
        document.getElementById("posts-deleted").textContent = deletedPosts;
        
        if (data.length === 0) {
            body.innerHTML = `
            <tr>
                <td colspan="4" class="no-data-message">
                    <i class="fas fa-inbox"></i>
                    <p>Chưa có dữ liệu</p>
                </td>
            </tr>`;
            return;
        }
        
        for (const post of data) {
            // Thêm style gạch ngang cho post đã xóa mềm
            const rowClass = post.isDeleted ? 'deleted-row' : '';
            const deleteStatus = post.isDeleted ? '<span class="badge badge-deleted"><i class="fas fa-trash"></i> Đã xóa</span>' : '<span class="badge badge-active"><i class="fas fa-check-circle"></i> Hoạt động</span>';
            
            body.innerHTML += `
            <tr class="${rowClass}">
                <td>${post.id}</td>
                <td>${post.title}</td>
                <td>${post.views}</td>
                <td>
                    <div class="btn-group-table">
                        <button class="btn btn-sm btn-warning" onclick="EditPost('${post.id}')">
                            <i class="fas fa-edit"></i> Sửa
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="Delete('${post.id}')">
                            <i class="fas fa-trash"></i> Xóa
                        </button>
                        ${deleteStatus}
                    </div>
                </td>
            </tr>`
        }
    } catch (error) {
        console.error("Error loading posts:", error);
    }
}

async function EditPost(id) {
    let res = await fetch('http://localhost:3000/posts/' + id);
    if (res.ok) {
        let post = await res.json();
        document.getElementById("id_txt").value = post.id;
        document.getElementById("title_txt").value = post.title;
        document.getElementById("views_txt").value = post.views;
        document.getElementById("id_txt").focus();
    }
}

async function Save() {
    let id = document.getElementById("id_txt").value;
    let title = document.getElementById("title_txt").value;
    let views = document.getElementById("views_txt").value;
    
    // Validation
    if (!title || title.trim() === '') {
        showToast('Vui lòng nhập tiêu đề', 'error');
        return;
    }
    
    let res;
    
    // Nếu ID trống, tự động tạo ID từ maxId + 1
    if (!id || id.trim() === '') {
        let allPosts = await fetch('http://localhost:3000/posts');
        let posts = await allPosts.json();
        let maxId = 0;
        for (const post of posts) {
            let postId = parseInt(post.id);
            if (postId > maxId) {
                maxId = postId;
            }
        }
        id = String(maxId + 1);
    }
    
    let getID = await fetch('http://localhost:3000/posts/' + id);
    if (getID.ok) {
        // Update existing post
        let existingPost = await getID.json();
        res = await fetch('http://localhost:3000/posts/'+id, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    id: id,
                    title: title,
                    views: views,
                    isDeleted: existingPost.isDeleted || false
                }
            )
        })
    } else {
        // Create new post
        res = await fetch('http://localhost:3000/posts', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    id: id,
                    title: title,
                    views: views,
                    isDeleted: false
                }
            )
        })
    }
    if (res.ok) {
        showToast('Lưu post thành công!', 'success');
        document.getElementById("id_txt").value = "";
        document.getElementById("title_txt").value = "";
        document.getElementById("views_txt").value = "";
        Load();
    } else {
        showToast('Lỗi khi lưu post', 'error');
    }
}

async function Delete(id) {
    // Soft delete: Cập nhật isDeleted = true thay vì xóa cứng
    let getPost = await fetch('http://localhost:3000/posts/' + id);
    if (getPost.ok) {
        let post = await getPost.json();
        let res = await fetch('http://localhost:3000/posts/' + id, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...post,
                isDeleted: true
            })
        });
        if (res.ok) {
            showToast('Xóa post thành công!', 'success');
            Load();
        }
    }
}

// ===== CRUD cho Comments =====
async function LoadComments() {
    try {
        let res = await fetch('http://localhost:3000/comments')
        let data = await res.json();
        let body = document.getElementById("comments-table-body");
        body.innerHTML = "";
        
        let totalComments = data.length;
        let activeComments = data.filter(c => !c.isDeleted).length;
        let deletedComments = data.filter(c => c.isDeleted).length;
        
        document.getElementById("comments-count").textContent = totalComments;
        document.getElementById("comments-active").textContent = activeComments;
        document.getElementById("comments-deleted").textContent = deletedComments;
        
        if (data.length === 0) {
            body.innerHTML = `
            <tr>
                <td colspan="4" class="no-data-message">
                    <i class="fas fa-inbox"></i>
                    <p>Chưa có dữ liệu</p>
                </td>
            </tr>`;
            return;
        }
        
        for (const comment of data) {
            const rowClass = comment.isDeleted ? 'deleted-row' : '';
            const deleteStatus = comment.isDeleted ? '<span class="badge badge-deleted"><i class="fas fa-trash"></i> Đã xóa</span>' : '<span class="badge badge-active"><i class="fas fa-check-circle"></i> Hoạt động</span>';
            
            body.innerHTML += `
            <tr ${rowClass ? `class="${rowClass}"` : ''}>
                <td>${comment.id}</td>
                <td>${comment.text}</td>
                <td>${comment.postId}</td>
                <td>
                    <div class="btn-group-table">
                        <button class="btn btn-sm btn-warning" onclick="EditComment('${comment.id}')">
                            <i class="fas fa-edit"></i> Sửa
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="DeleteComment('${comment.id}')">
                            <i class="fas fa-trash"></i> Xóa
                        </button>
                        ${deleteStatus}
                    </div>
                </td>
            </tr>`
        }
    } catch (error) {
        console.error("Error loading comments:", error);
    }
}

async function SaveComment() {
    let id = document.getElementById("comment_id_txt").value;
    let text = document.getElementById("comment_text_txt").value;
    let postId = document.getElementById("comment_postId_txt").value;
    
    // Validation
    if (!text || text.trim() === '') {
        showToast('Vui lòng nhập nội dung comment', 'error');
        return;
    }
    if (!postId || postId.trim() === '') {
        showToast('Vui lòng nhập Post ID', 'error');
        return;
    }
    
    let res;
    
    // Nếu ID trống, tự động tạo ID từ maxId + 1
    if (!id || id.trim() === '') {
        let allComments = await fetch('http://localhost:3000/comments');
        let comments = await allComments.json();
        let maxId = 0;
        for (const comment of comments) {
            let commentId = parseInt(comment.id);
            if (commentId > maxId) {
                maxId = commentId;
            }
        }
        id = String(maxId + 1);
    }
    
    let getID = await fetch('http://localhost:3000/comments/' + id);
    if (getID.ok) {
        // Update existing comment
        let existingComment = await getID.json();
        res = await fetch('http://localhost:3000/comments/'+id, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    id: id,
                    text: text,
                    postId: postId,
                    isDeleted: existingComment.isDeleted || false
                }
            )
        })
    } else {
        // Create new comment
        res = await fetch('http://localhost:3000/comments', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    id: id,
                    text: text,
                    postId: postId,
                    isDeleted: false
                }
            )
        })
    }
    if (res.ok) {
        showToast('Lưu comment thành công!', 'success');
        document.getElementById("comment_id_txt").value = "";
        document.getElementById("comment_text_txt").value = "";
        document.getElementById("comment_postId_txt").value = "";
        LoadComments();
    } else {
        showToast('Lỗi khi lưu comment', 'error');
    }
}

async function EditComment(id) {
    let res = await fetch('http://localhost:3000/comments/' + id);
    if (res.ok) {
        let comment = await res.json();
        document.getElementById("comment_id_txt").value = comment.id;
        document.getElementById("comment_text_txt").value = comment.text;
        document.getElementById("comment_postId_txt").value = comment.postId;
        document.getElementById("comment_id_txt").focus();
    }
}

async function DeleteComment(id) {
    // Soft delete: Cập nhật isDeleted = true thay vì xóa cứng
    let getComment = await fetch('http://localhost:3000/comments/' + id);
    if (getComment.ok) {
        let comment = await getComment.json();
        let res = await fetch('http://localhost:3000/comments/' + id, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...comment,
                isDeleted: true
            })
        });
        if (res.ok) {
            showToast('Xóa comment thành công!', 'success');
            LoadComments();
        }
    }
}

// Notification Toast
function showToast(message, type = 'success') {
    const container = document.querySelector('.toast-container');
    const toastId = 'toast-' + Date.now();
    
    const toastHTML = `
        <div id="${toastId}" class="toast ${type}" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close" onclick="document.getElementById('${toastId}').remove()"></button>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', toastHTML);
    
    setTimeout(() => {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }
    }, 3000);
}

Load();
LoadComments();
