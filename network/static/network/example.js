const redHeart = `
<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
    <path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"/>
</svg>
`

const emptyHeart = `
<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
    <path d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20c0 0-.1-.1-.1-.1c0 0 0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5v3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2v-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z"/>
</svg>
`

document.addEventListener('DOMContentLoaded', () => {
    const postButton = document.querySelector('#post-button');
    // Because this element is not in other pages than index so console will show error when not found
    if (postButton) {
        postButton.addEventListener('click', event => post(event));
    }
})

function post(event) {
    event.preventDefault();
    const content = document.querySelector('#post-text-box').value;
    
    fetch('/post', {
        method: 'POST',
        body: JSON.stringify({
            content: content
        })
    })
    .then(response => response.json())
    .then(result => {
        const messages = document.querySelector('#messages');
        messages.style.display = 'block';
        messages.className = `alert alert-${result.error?"danger":"success"}`;
        messages.innerHTML = result.error?result.error:result.message + " Plaese wait for the page to be reloaded!";
        
        setTimeout(() => {
            messages.style.display = 'none';
          }, 3000); 
        
        // if post successfull then empty the post text box
        if (result.message) {
            document.querySelector('#post-text-box').value = "";
            setTimeout(() => {
                location.reload();
            }, 3000);
        }
    })

}

function edit(id) {
    const contentElement = document.querySelector(`#content-${id}`);
    const content = contentElement.innerHTML;
    

    // Creating form element
    const editForm = document.createElement('form');
    editForm.id = "edit_form"

    // creating textarea element
    const textarea = document.createElement('textarea');
    textarea.className = 'form-control';
    textarea.id = 'edit-post-text-box';
    textarea.value = content;

    // Creating button element
    const btn = document.createElement('button');
    btn.id = 'edit-post-button';
    btn.className = 'btn btn-primary';
    btn.innerHTML = 'Save';

    // save button click event listener
    btn.addEventListener('click', event => saveEdit(event, id));

    // Appending textarea and button to the form element
    editForm.append(textarea);
    editForm.append(btn);

    // Appending form element to the parent post-container
    contentElement.replaceWith(editForm);
}

function saveEdit(event, id) {
    event.preventDefault();
    
    const editForm = document.querySelector('#edit_form');
    const edit_box = document.querySelector('#edit-post-text-box');
    fetch(`/post`, {
        method: 'PUT',
        body: JSON.stringify({
            id:id,
            content: edit_box.value
        })
    })
    .then(response => response.json())
    .then(result => {
        
        // Showing Message 
        const messages = document.querySelector('#messages');
        messages.style.display = 'block';
        messages.className = `alert alert-${result.error?"danger":"success"}`;
        messages.innerHTML = result.error?result.error:result.message;
        
        setTimeout(() => {
            messages.style.display = 'none';
        }, 3000); 
        
        // If Edited successfully the replace text form with post content
        if (result.message) {
            
            contentElement = document.createElement('p');
            contentElement.id = `content-${id}`;
            contentElement.innerHTML = edit_box.value;

            editForm.replaceWith(contentElement);
        }
        
    })

}

function likePost(id) {
    const likeCounterElement = document.querySelector(`#like_counter-${id}`);
    
    
    
    const likeEmojiElement = document.querySelector(`#like_emoji-${id}`);
    
    fetch(`/like`, {
        method: 'PUT',
        body: JSON.stringify({
            id:id
        })
    })
    .then(response => response.json())
    .then(result => {
        likeCounterElement.innerHTML = result.like_count;
        likeEmojiElement.innerHTML = result.liked?redHeart:emptyHeart;
    })
}

{% for post in posts %}
    <div class="post-container">
        <a href="{% url 'profile' post.user %}"><label>{{post.user}}</label></a>
        {% if post.user == user %}
            <a onclick="edit({{post.id}})" style="display: block; color: blue; cursor: pointer;">Edit</a>
        {% endif %}
        <p id="content-{{post.id}}">{{post.content}}</p>
        <p class="timestamp">{{post.timestamp}}</p>
        <p {% if user.is_authenticated %} onclick="likePost({{post.id}})" {% endif %} class="likes">
            <span id="like_emoji-{{post.id}}">
                {% if post.liked %}
                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"/></svg>
                {% else %}
                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20c0 0-.1-.1-.1-.1c0 0 0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5v3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2v-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z"/></svg>
                {% endif %}
            </span>
            <span id="like_counter-{{post.id}}">{{post.like_count}}</span></p>
    </div>
{% endfor %}


<script>
        function getCookie(name){
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if(parts.length == 2) return parts.pop().split(';').shift();
        }


        function edit_my_post(id){
            const textarea_value = document.getElementById(`textarea_${id}`).value
            const content = document.getElementById(`content_${id}`);
            const modal = document.getElementById(`modal_edit_post_${id}`);
            fetch(`/edit_post/${id}`, {
                method: "POST",
                headers: {"Content-type": "application/json", "X-CSRFToken": getCookie("csrftoken")},
                body: JSON.stringify({
                    content: textarea_value
                })
            })
            .then(response => response.json())
            .then(result => {
                content.innerHTML = result.data;

                modal.classList.remove('show');
                modal.setAttribute('aria-hidden', 'true');
                modal.setAttribute('style', 'display: none');

                //get modal backdrops
                const modalsBackdrops = document.getElementsByClassName('modal-backdrop');

                for(let i=0; i<modalsBackdrops.length; i++){
                    document.body.removeChild(modalsBackdrops[i]);
                }
            })
        }

        // unlike button
        function unlike_button(id){
            fetch(`/unlike/${id}`)
            .then(response => response.json())
            .then(result => {
                console.log(result);
            })
            location.reload();
        }

        // like_button
        function like_button(id){
            fetch(`/like/${id}`)
            .then(response => response.json())
            .then(result => {
                console.log(result);
            })
            location.reload();
        }

    </script>