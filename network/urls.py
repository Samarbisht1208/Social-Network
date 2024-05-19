
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("create", views.new_post, name="create_new_post"),
    path("user_profile/<int:user_id>", views.profile, name="profile"),
    path("unfollow", views.unfollow, name="unfollow"),
    path("follow", views.follow, name="follow"),
    path("edit_profile/<int:user_id>",views.edit_profile,name="edit_profile"),
    path("following_post/<int:user_id>",views.following_post,name="following_post"),
    path("edit_post/<int:post_id>", views.edit_post, name="edit_post"),
    path("like_handler/<int:post_id>", views.like_handler, name="like_handler"),
]
