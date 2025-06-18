from rest_framework.routers import DefaultRouter
from .views import BlogViewSet, CommentViewSet, RegisterView, LoginView, ChangePasswordView, AvatarUploadView, CategoryViewSet, TagViewSet, BookmarkViewSet, LikeViewSet, ImageUploadView, NotificationViewSet, FollowViewSet
from django.urls import path, include

router = DefaultRouter()
router.register('blogs', BlogViewSet)
router.register('comments', CommentViewSet)
router.register('categories', CategoryViewSet)
router.register('tags', TagViewSet)
router.register('bookmarks', BookmarkViewSet)
router.register('likes', LikeViewSet)
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'follows', FollowViewSet, basename='follow')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('avatar-upload/', AvatarUploadView.as_view(), name='avatar-upload'),
    path('image-upload/', ImageUploadView.as_view(), name='image-upload'),
    path('', include(router.urls)),
]
