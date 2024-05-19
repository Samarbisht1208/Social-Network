from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    profile_picture = models.CharField(max_length=10000, null=True)
    profile_name = models.CharField(max_length=50, null=True)


class Post(models.Model):
    user =  models.ForeignKey(User, on_delete=models.CASCADE, related_name="author")
    thought = models.CharField(max_length=10000)
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.IntegerField(default=0)

    def __str__(self):
        return f"Post {self.id} made by {self.user} on {self.timestamp}" 
    
class Follow(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_who_is_following")
    user_following = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_who_is_being_followed")

    def __str__(self):
        return f"{self.user} is following {self.user_following}" 
    

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_likes")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes_this_post")

    def __str__(self):
        return f"{self.user} liked {self.post}"