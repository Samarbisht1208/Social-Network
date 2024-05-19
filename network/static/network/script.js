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



// red heart
const red_heart =   `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" id="like_handler{{i.id}}" class="bi bi-heart-fill" viewBox="0 0 16 16" style="color: red;">
                        <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"/>
                    </svg>`

const empty_heart = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" id="like_handler{{i.id}}" class="bi bi-heart" viewBox="0 0 16 16">
                         <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>
                    </svg>`


function like_handler(id){
    const button = document.getElementById(`like_handler${id}`)
    const likes_count = document.getElementById(`likes_count${id}`)
    console.log(id)

    fetch(`like_handler/${id}`)
    .then(response => response.json())
    .then(result => {
        button.innerHTML = result.like?red_heart:empty_heart
        if (result.like_count > 0){
            likes_count.innerHTML = result.like_count
        } else {
            likes_count.innerHTML = ""
        }
    })

}


