from django.conf.urls import url, include
from django.contrib.auth.models import User
from django.conf import settings
from django.conf.urls.static import static

import django_filters
from rest_framework.schemas import get_schema_view
from rest_framework import generics, serializers, viewsets, routers, response
from rest_framework.permissions import IsAdminUser
from scrolls.models import Scroll, Event, Note, NoteMedia, MediaType, ContentType
import urllib

from allauth.socialaccount.providers.facebook.views import FacebookOAuth2Adapter
from rest_auth.registration.views import SocialLoginView

from allauth.socialaccount.providers.twitter.views import TwitterOAuthAdapter
from rest_auth.views import LoginView
from rest_auth.social_serializers import TwitterLoginSerializer


class FacebookLogin(SocialLoginView):
    adapter_class = FacebookOAuth2Adapter


class TwitterLogin(LoginView):
    serializer_class = TwitterLoginSerializer
    adapter_class = TwitterOAuthAdapter


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('url', 'username', 'email', 'is_staff')


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]


class MediaTypeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = MediaType
        fields = ('name',)


class MediaTypeViewSet(viewsets.ModelViewSet):
    queryset = MediaType.objects.all()
    serializer_class = MediaTypeSerializer


class ContentTypeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = ContentType
        fields = ('name',)


class ContentTypeViewSet(viewsets.ModelViewSet):
    queryset = ContentType.objects.all()
    serializer_class = ContentTypeSerializer


class ScrollSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Scroll
        fields = ('id', 'user', 'created',
                  'title', 'description',)

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        s = Scroll(**validated_data)
        s.save()
        return s
    

class ScrollViewSet(viewsets.ModelViewSet):
    queryset = Scroll.objects.all()
    serializer_class = ScrollSerializer


class EventFilter(django_filters.rest_framework.FilterSet):
    start = django_filters.IsoDateTimeFilter(name='datetime',
                                             lookup_expr='gte')
    before = django_filters.IsoDateTimeFilter(name='datetime',
                                              lookup_expr='lt')

    class Meta:
        model = Event
        fields = ['start', 'before']


class EventSerializer(serializers.HyperlinkedModelSerializer):
    scroll_title = serializers.CharField(read_only=True, source="scroll.title")
    scroll_id = serializers.IntegerField(read_only=True, source="scroll.id")
    
    class Meta:
        model = Event
        fields = ('url',
                  'scroll',
                  'scroll_title',
                  'scroll_id',
                  'created',
                  'title',
                  'text',
                  'ranking',
                  'mediatype',
                  'resolution',
                  'datetime',
                  'source_url',
                  'source_date',
                  'content_url')


class EventViewSet(viewsets.ModelViewSet):
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)
    filter_class = EventFilter
    queryset = Event.objects.select_related('scroll')
    serializer_class = EventSerializer


# Note
class NoteSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Note
        fields = ('id',
                  'order',
                  'created',
                  'last_updated',
                  'text',
                  'display_type')


class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer


# Routers provide a way of automatically determining the URL conf.
router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'mediatypes', MediaTypeViewSet)
router.register(r'contenttypes', ContentTypeViewSet)
router.register(r'scrolls', ScrollViewSet)
router.register(r'events', EventViewSet)
router.register(r'notes', NoteViewSet)

schema_view = get_schema_view(title="Unscroll API")

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    url('^schema/$', schema_view),
    url(r'^api/0/', include(router.urls)),
    url(r'^rest-auth/', include('rest_auth.urls')),
    url(r'^api-auth/', include('rest_framework.urls',
                               namespace='rest_framework')),
    url(r'^rest-auth/registration/', include('rest_auth.registration.urls')),
    url(r'^rest-auth/twitter/$', TwitterLogin.as_view(), name='twitter_login'),
    url(r'^rest-auth/facebook/$', FacebookLogin.as_view(), name='fb_login'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

urlpatterns += [url(r'^silk/', include('silk.urls', namespace='silk'))]
