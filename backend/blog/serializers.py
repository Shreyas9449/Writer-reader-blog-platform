from rest_framework import serializers
from .models import Blog, Comment, Profile, Category, Tag, Bookmark, Like, Notification, Follow
from django.contrib.auth.models import User

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['avatar']

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    follower_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ['id', 'username', 'is_superuser', 'profile', 'follower_count', 'following_count']

    def get_follower_count(self, obj):
        return obj.followers.count()

    def get_following_count(self, obj):
        return obj.following.count()

class CommentSerializer(serializers.ModelSerializer):
    commenter = UserSerializer(read_only=True)
    class Meta:
        model = Comment
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

class BlogSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), source='category', write_only=True, required=False)
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(queryset=Tag.objects.all(), source='tags', many=True, write_only=True, required=False)
    liked_by = serializers.SerializerMethodField()
    bookmarked_by = serializers.SerializerMethodField()

    class Meta:
        model = Blog
        fields = '__all__'

    def get_liked_by(self, obj):
        return list(obj.liked_by.values_list('user_id', flat=True))

    def get_bookmarked_by(self, obj):
        return list(obj.bookmarked_by.values_list('user_id', flat=True))

class BookmarkSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    blog = serializers.PrimaryKeyRelatedField(queryset=Blog.objects.all())
    class Meta:
        model = Bookmark
        fields = ['id', 'user', 'blog', 'created_at']

class LikeSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    blog = serializers.PrimaryKeyRelatedField(queryset=Blog.objects.all())

    def validate(self, data):
        user = self.context['request'].user
        blog = data.get('blog')
        if Like.objects.filter(user=user, blog=blog).exists():
            raise serializers.ValidationError({'blog': 'You have already liked this blog.'})
        return data
    class Meta:
        model = Like
        fields = ['id', 'user', 'blog', 'created_at']

class NotificationSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    blog = BlogSerializer(read_only=True)
    class Meta:
        model = Notification
        fields = ['id', 'user', 'sender', 'blog', 'notif_type', 'message', 'is_read', 'created_at']

class FollowSerializer(serializers.ModelSerializer):
    follower = UserSerializer(read_only=True)
    following = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'created_at']
    def validate(self, data):
        user = self.context['request'].user
        following = data.get('following')
        if user == following:
            raise serializers.ValidationError({'following': 'You cannot follow yourself.'})
        if Follow.objects.filter(follower=user, following=following).exists():
            raise serializers.ValidationError({'following': 'You are already following this user.'})
        return data
