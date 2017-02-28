from django.conf.urls import url, include
from django.contrib.auth.models import User
import django_filters
from rest_framework.schemas import get_schema_view
from rest_framework import generics, serializers, viewsets, routers, response
from rest_framework.permissions import IsAdminUser
from scrolls.models import Scroll, Event, Note, NoteMedia, MediaType, ContentType
import urllib

# User
class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('url', 'username','email', 'is_staff')

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

# MediaType
class MediaTypeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = MediaType
        fields = ('identifier', 'title')        

class MediaTypeViewSet(viewsets.ModelViewSet):
    queryset = MediaType.objects.all()
    serializer_class = MediaTypeSerializer

# ContentType
class ContentTypeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = ContentType
        fields = ('identifier', 'title')

class ContentTypeViewSet(viewsets.ModelViewSet):
    queryset = ContentType.objects.all()
    serializer_class = ContentTypeSerializer

# Scroll
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

# Event

class EventFilter(django_filters.rest_framework.FilterSet):
    start = django_filters.IsoDateTimeFilter(name='datetime', lookup_expr='gte')
    before = django_filters.IsoDateTimeFilter(name='datetime', lookup_expr='lt')
    class Meta:
        model = Event
        fields = ['start','before']


class EventSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Event
        fields = ('url','scroll', 'created', 'title',
                  'text','mediatype', 'datetime',
                  'source_url','source_date',
                  'content_url')

class EventViewSet(viewsets.ModelViewSet):
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)
    filter_class = EventFilter
    queryset = Event.objects.all()
    serializer_class = EventSerializer


# Note
class NoteSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Note
        fields = ('id', 'order', 'created', 'last_updated',
                  'text', 'display_type', 'scroll')

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
    url(r'^', include(router.urls)),
    url(r'^rest-auth/', include('rest_auth.urls')),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))
    
]
