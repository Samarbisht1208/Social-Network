from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

import json
from django.http import JsonResponse

from .models import User, Post, Follow, Like

from django.core.paginator import Paginator


def index(request):
    all_posts = Post.objects.all().order_by("id").reverse()

    #Pagination
    paginator = Paginator(all_posts, 10)
    page_number = request.GET.get('page')
    posts_of_the_page = paginator.get_page(page_number)

    # like's part
    all_likes = Like.objects.all()

    who_you_liked = []
    try:
        for i in all_likes:
            if i.user.id == request.user.id:
                who_you_liked.append(i.post.id)
    except:
        who_you_liked = []

    return render(request, "network/index.html", {
        "all_posts_placeholder": all_posts,
        "posts_of_the_page_placeholder": posts_of_the_page,
        "likes_placeholder": who_you_liked
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
    

def new_post(request):
    if request.method == "POST":
        content = request.POST['new_post_data']
        user = User.objects.get(pk=request.user.id)
        post = Post(thought=content, user=user)
        post.save()
        return HttpResponseRedirect(reverse(index))
    
def profile(request, user_id):
    user = User.objects.get(pk=user_id)
    all_posts_from_user = Post.objects.filter(user=user).order_by("id").reverse()

    following = Follow.objects.filter(user=user)
    followers = Follow.objects.filter(user_following=user)

    try:
        check_follow = followers.filter(user=User.objects.get(pk=request.user.id))
        if len(check_follow) != 0:
            isFollowing = True
        else:
            isFollowing = False
    except:
        isFollowing = False

    #Pagination
    paginator = Paginator(all_posts_from_user, 10)
    page_number = request.GET.get('page')
    posts_of_the_page = paginator.get_page(page_number)

    # like's part
    all_likes = Like.objects.all()

    who_you_liked = []
    try:
        for i in all_likes:
            if i.user.id == request.user.id:
                who_you_liked.append(i.post.id)
    except:
        who_you_liked = []

    return render(request, "network/profile.html",{
        "all_posts_from_single_user": all_posts_from_user,
        "posts_of_the_page_placeholder": posts_of_the_page,
        "followers_placeholder": followers,
        "following_placeholder": following,
        "is_following_placeholder": isFollowing,
        "user_profile_placeholder": user,
        "likes_placeholder": who_you_liked
    })

def follow(request):
    user_follow = request.POST['userfollow']
    currentUser = User.objects.get(pk=request.user.id)
    user_follow_data = User.objects.get(username=user_follow)
    f = Follow(user=currentUser, user_following=user_follow_data)
    f.save()
    user_id = user_follow_data.id
    return HttpResponseRedirect(reverse(profile, kwargs={'user_id': user_id}))

def unfollow(request):
    user_follow = request.POST['userfollow']
    currentUser = User.objects.get(pk=request.user.id)
    user_follow_data = User.objects.get(username=user_follow)
    f = Follow.objects.get(user=currentUser, user_following=user_follow_data)
    f.delete()
    user_id = user_follow_data.id
    return HttpResponseRedirect(reverse(profile, kwargs={'user_id': user_id}))

def edit_profile(request, user_id):
    if request.method == 'GET':
        user = User.objects.get(pk=user_id)
        return render(request, "network/edit_profile.html", {
            "user_placeholder": user
        })
    else:
        profile_img = request.POST["image_data"]
        profile_name = request.POST["profile_name_data"]
        if not profile_img and not profile_name:
            return HttpResponseRedirect(reverse(edit_profile, kwargs={'user_id': user_id}))
        else:
            current_user = User.objects.get(pk=user_id)
            # saving the profilr_name
            current_user.profile_name = profile_name
            current_user.profile_picture = profile_img
            current_user.save()

            return HttpResponseRedirect(reverse(index))

       

def following_post(request, user_id):
    current_user = User.objects.get(pk=user_id)
    following_people = Follow.objects.filter(user=current_user)
    all_posts = Post.objects.all().order_by("id").reverse()
    following_people_post = []

    # iterating the all_posts for filtering the following people post
    for i in all_posts:
        for person in following_people:
            if person.user_following == i.user:
                following_people_post.append(i)

    #Pagination
    paginator = Paginator(following_people_post, 10)
    page_number = request.GET.get('page')
    posts_of_the_page = paginator.get_page(page_number)

    # like's part
    all_likes = Like.objects.all()

    who_you_liked = []
    try:
        for i in all_likes:
            if i.user.id == request.user.id:
                who_you_liked.append(i.post.id)
    except:
        who_you_liked = []

    return render(request, "network/following_post.html", {
        "posts_of_the_page_placeholder": posts_of_the_page,
        "likes_placeholder": who_you_liked
    })

def edit_post(request, post_id):
    if request.method == "POST":
        data = json.loads(request.body)
        edit_post = Post.objects.get(pk=post_id)
        edit_post.thought = data["content"]
        edit_post.save()
        return JsonResponse({"message": "Change successfull", "data": data["content"]})
    
def like_handler(request, post_id):
    post = Post.objects.get(pk=post_id)
    user = User.objects.get(pk=request.user.id)
    print(post)
    print(user)
    # finding the liked post
    like = Like.objects.filter(user=user, post=post)
    if like:
        # deleting the liked data
        like.delete()
        # decrease thr liked count
        post.likes -= 1
        likes_count = post.likes
        post.save()
        return JsonResponse({"message": "like removed successfull", "like": False, "like_count": likes_count })
    else:
        # adding the like
        new_like = Like(user=user, post=post)
        new_like.save()
        # increasing the like count
        post.likes += 1
        likes_count = post.likes
        post.save()

        return JsonResponse({"message": "like added successfull", "like": True, "like_count": likes_count})






# def add_like(request, post_id):
#     post = Post.objects.get(pk=post_id)
#     user = User.objects.get(pk=request.user.id)
#     like = Like.objects.filter(user=user, post=post)
#     if not like:
#         # adding the like
#         new_like = Like(user=user, post=post)
#         new_like.save()
#         # increasing the like count
#         post.likes += 1
#         likes_count = post.likes
#         post.save()

#         return JsonResponse({"message": "like added successfull", "like": True, "like_count": likes_count})
#     return JsonResponse({"message": "already liked"})