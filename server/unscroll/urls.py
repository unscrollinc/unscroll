from django.contrib import admin
from django.urls import path

from django.conf.urls import url, include
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.conf import settings
from django.conf.urls.static import static
import django_filters
from django.db.models import Max, Min, Count
from rest_framework import pagination
from rest_framework import generics, serializers, viewsets, routers, response
from rest_framework.decorators import detail_route, list_route
from rest_framework.permissions import IsAdminUser, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from scrolls.models import User, Scroll, Event, Notebook, Note, Media, Thumbnail
from rest_framework_swagger.views import get_swagger_view
from PIL import Image, ImageOps
from io import BytesIO
import requests
import hashlib
import pprint
from baseconv import base36
from os import makedirs
from urllib.request import unquote
from rest_framework_bulk.routes import BulkRouter
import re
from rest_framework_bulk import (
    BulkListSerializer,
    BulkModelViewSet,
    BulkSerializerMixin,
    ListBulkCreateUpdateDestroyAPIView,
)


class ThumbnailSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Thumbnail
        fields = (
            'url',
            'user',
            'sha1',
            'width',
            'height',
            'image_location',
            'source_url')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        s = Thumbnail(**validated_data)
        s.save()
        return s


class ThumbnailViewSet(viewsets.ModelViewSet):
    queryset = Thumbnail.objects.all()
    serializer_class = ThumbnailSerializer
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)
    filter_fields = ('source_url',)

    def hash_image(self, o):
        img_hash = hashlib.sha1(o)
        img_hex = img_hash.hexdigest()
        img_int = int(img_hex, 16)
        img_36 = base36.encode(img_int)
        img_dir = 'img/{}/{}'.format(img_36[0:2], img_36[2:4],)
        img_filename = "{}/{}.jpg".format(img_dir, img_36,)
        return {
            'img_hash': img_36,
            'img_dir': img_dir,
            'img_filename': img_filename
        }

    def perform_create(self, serializer):
        source_url = serializer.initial_data['source_url']
        r = requests.get(source_url)
        img = Image.open(BytesIO(r.content))
        img.convert("RGBA")
        width, height = img.size
        thumb = img
        if width > settings.THUMBNAIL_SIZE[0]:
            thumb = ImageOps.fit(img, settings.THUMBNAIL_SIZE)
            width, height = thumb.size
        hashed = self.hash_image(thumb.tobytes())
        try:
            makedirs('{}/{}'.format(settings.THUMBNAIL_DIR,
                                    hashed['img_dir'],))
            thumb\
                .convert('RGB')\
                .save('{}/{}'
                      .format(settings.THUMBNAIL_DIR, hashed['img_filename']),
                      quality=50,
                      optimize=True,
                      progressive=True)

        except FileExistsError as e:
            print(e)
            pass

        serializer.save(
            source_url=source_url,
            user=self.request.user,
            image_location=hashed['img_filename'],
            width=width,
            height=height,
            sha1=hashed['img_hash'])


class EventFilter(django_filters.rest_framework.FilterSet):
    start = django_filters.IsoDateTimeFilter(
        name='when_happened',
        lookup_expr='gte')
    before = django_filters.IsoDateTimeFilter(
        name='when_happened',
        lookup_expr='lt')
    scroll = django_filters.UUIDFilter(
        name="scroll__uuid")

    q = django_filters.CharFilter(method='filter_by_q', distinct=True)

    # TODO THIS THING IS FRANKLY REAL DODGY
    def filter_by_q(self, queryset, what_is_this_arg_i_do_not_know, value):
        uq = unquote(value)
        apos = re.sub("'", "''", uq)
        filtered_val = "'{}'".format(apos,)
        return queryset.full_text_search(filtered_val)

    class Meta:
        model = Event
        fields = ['start', 'before', 'scroll', ]


class BulkEventSerializer(BulkSerializerMixin,
                          serializers.HyperlinkedModelSerializer):
    scroll_title = serializers.CharField(
        read_only=True,
        source="in_scroll.title")
    scroll_uuid = serializers.UUIDField(
        read_only=True,
        source="in_scroll.uuid")
    username = serializers.CharField(
        read_only=True,
        source="by_user.username")
    is_public = serializers.BooleanField(
        read_only=True,
        source="in_scroll.is_public")
    scroll_thumb_image = serializers.CharField(
        read_only=True,
        source="in_scroll.thumbnail.image_location")
    thumb_height = serializers.IntegerField(
        read_only=True,
        source="with_thumbnail.height")
    thumb_width = serializers.IntegerField(
        read_only=True,
        source="with_thumbnail.width")
    thumb_image = serializers.CharField(
        read_only=True,
        source="with_thumbnail.image_location")

    class Meta:
        model = Event
        fields = (
            'url',
            'uuid',
            'by_user',
            'username',
            'in_scroll',
            'scroll_uuid',
            'scroll_title',
            'is_public',
            'scroll_thumb_image',
            'with_thumbnail',
            'thumb_height',
            'thumb_width',
            'thumb_image',
            'when_created',
            'title',
            'text',
            'ranking',
            'media_type',
            'content_type',
            'resolution',
            'when_happened',
            'content_url',
            'source_name',
            'source_url')
        read_only_fields = ('uuid', 'by_user',)
        list_serializer_class = BulkListSerializer

    def create(self, validated_data):
        validated_data['by_user'] = self.context['request'].user
        s = Event(**validated_data)
        s.save()
        return s


class BulkEventViewSet(BulkModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = Event.objects.select_related('in_scroll', 'by_user')\
                            .filter(in_scroll__is_public=True)
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)
    filter_class = EventFilter
    serializer_class = BulkEventSerializer

    @list_route()
    def maxmin(self, request):
        filtered = EventFilter(request.GET,
                               queryset=Event.objects)
        qs = filtered.qs\
                     .filter(scroll__public=True)\
                     .aggregate(
                         count=Count('*'),
                         last_event=Max('when_happened'),
                         first_event=Min('when_happened'))
        return Response(qs)

    @list_route()
    def search(self, request):
        filtered = EventFilter(request.GET,
                               queryset=Event.objects
                               .select_related('scroll', 'user', 'thumbnail')
                               .filter(scroll__public=True))

        page = self.paginate_queryset(filtered.qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

# ##############################
# NOTES
# ##############################
class NoteSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = Note
        fields = (
            'id',
            'url',
            'uuid',
            'in_scroll',
            'kind',
            'by_user',
            'event',
            'order',
            'when_created',
            'when_modified',
            'text',)

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        s = Note(**validated_data)
        s.save()
        return s


class NoteEventSerializer(serializers.HyperlinkedModelSerializer):
    event_full = BulkEventSerializer(
        source='event',
        many=False,
        read_only=True)

    class Meta:
        model = Note
        fields = (
            'id',
            'url',            
            'uuid',
            'kind',            
            'in_scroll',
            'by_user',
            'event_full',
            'order',
            'when_created',
            'when_modified',
            'text',)


class NoteViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]    
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    ordering_fields = ('order',)
    ordering = ('order',)

    


class BulkNoteSerializer(BulkSerializerMixin,
                         serializers.HyperlinkedModelSerializer):

    event_full = BulkEventSerializer(
        source='event',
        many=False,
        read_only=True)

    public = serializers.BooleanField(
        read_only=True,
        source="scroll.public")

    scroll_uuid = serializers.UUIDField(
        read_only=True,
        source="scroll.uuid")

    class Meta(object):
        model = Note
        fields = (
            'id',
            'url',
            'in_scroll',
            'scroll_uuid',
            'kind',
            'public',
            'by_user',
            'in_event',
            'event_full',
            'point',
            'order',
            'when_created',
            'when_modified',
            'text')
        list_serializer_class = BulkListSerializer

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        s = Note(**validated_data)
        s.save()
        return s


class NoteFilter(django_filters.rest_framework.FilterSet):
    scroll = django_filters.UUIDFilter(
        name="scroll__uuid")
    
    class Meta:
        model = Note
        fields = ['scroll', ]


class BulkNoteViewSet(BulkModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = Note.objects.select_related(
        'scroll',
        'event',
        'user')
    serializer_class = BulkNoteSerializer
    filter_class = NoteFilter
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)
    filter_class = NoteFilter


class ScrollFilter(django_filters.rest_framework.FilterSet):
    class Meta:
        model = Scroll
        fields = ['uuid', 'title', 'by_user__username']

class ScrollSerializer(serializers.HyperlinkedModelSerializer):
    user_username = serializers.CharField(
        read_only=True,
        source="by_user.username")
    first_event = serializers.DateTimeField(
        read_only=True)
    last_event = serializers.DateTimeField(
        read_only=True)
    event_count = serializers.IntegerField(
        read_only=True)

    class Meta:
        model = Scroll
        fields = (
            'uuid',
            'url',
            'by_user',
            'user_username',
            'event_count',
            'first_event',
            'last_event',
            'when_created',
            'when_modified',            
            'title',
            'is_public',
            'subtitle',
            'description',
            'with_thumbnail',)
        depth = 0
        read_only_fields = (
            'uuid',
            'by_user',
            'notes',
            'user_username',
            'event_count',
            'first_event',
            'last_event',)

    def create(self, validated_data):
        validated_data['by_user'] = self.context['request'].user
        s = Scroll(**validated_data)
        s.save()
        return s


class ScrollViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = ScrollSerializer
    queryset = Scroll.objects.select_related('by_user')\
                             .filter(is_public=True)\
                             .annotate(
                                 event_count=Count('events'),
                                 first_event=Min('events__when_happened'),
                                 last_event=Max('events__when_happened'))
    filter_class = ScrollFilter

    @detail_route(methods=['get'])
    def notes(self, request, pk=None):
        notes = Note.objects\
                    .select_related('event')\
                    .filter(scroll_id=pk)
        serializer = NoteEventSerializer(
            notes,
            context={'request': request},
            many=True)
        return Response(serializer.data)

class NotebookFilter(django_filters.rest_framework.FilterSet):
    class Meta:
        model = Notebook
        fields = ['uuid', 'title', 'by_user__username']

class NotebookSerializer(serializers.HyperlinkedModelSerializer):
    user_username = serializers.CharField(
        read_only=True,
        source="user.username")

    class Meta:
        model = Notebook
        fields = (
            'uuid',
            'url',
            'by_user',
            'user_username',
            'when_created',
            'when_modified',            
            'title',
            'is_public',
            'subtitle',
            'description',)
        depth = 0
        read_only_fields = (
            'uuid',
            'by_user',
            'notes',
            'user_username',)

    def create(self, validated_data):
        validated_data['by_user'] = self.context['request'].user
        s = Notebook(**validated_data)
        s.save()
        return s


class NotebookViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = NotebookSerializer
    queryset = Notebook.objects.select_related('by_user')\
                             .filter(is_public=True)
    filter_class = NotebookFilter

    @detail_route(methods=['get'])
    def notes(self, request, pk=None):
        notes = Note.objects\
                    .select_related('event')\
                    .filter(in_notebook=pk)
        serializer = NoteEventSerializer(
            notes,
            context={'request': request},
            many=True)
        return Response(serializer.data)

class UserSerializer(serializers.HyperlinkedModelSerializer):
    full_scrolls = ScrollSerializer(User.full_scrolls, many=True)

    class Meta:
        model = User
        fields = (
            'url',
            'username',
            'email',
            'full_scrolls',
            'is_staff')


class UserViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = UserSerializer
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]

    @list_route()
    def scrolls(self, request):
        user = self.request.user
        scrolls = Scroll.objects\
                        .select_related('user')\
                        .filter(user__id=user.id, is_public=True)\
                        .annotate(
                            event_count=Count('events'),
                            first_event=Min('events__datetime'),
                            last_event=Max('events__datetime'))
        serializer = ScrollSerializer(
            scrolls,
            context={'request': request},
            many=True)
        return Response(serializer.data)

# Routers provide a way of automatically determining the URL conf.
router = BulkRouter()
# router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'scrolls', ScrollViewSet)
router.register(r'notebooks', NotebookViewSet)
router.register(r'thumbnails', ThumbnailViewSet)
router.register(r'events', BulkEventViewSet)
router.register(r'notes', BulkNoteViewSet)

schema_view = get_swagger_view(title='Unscroll API')
# schema_view = get_schema_view(title="Unscroll API")

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    url(r'', include(router.urls)),
    path('admin/', admin.site.urls),
    url(r'^auth/', include('djoser.urls.authtoken')),
] + static(settings.STATIC_URL,
           document_root=settings.STATIC_ROOT)

# urlpatterns += [url(r'^silk/', include('silk.urls', namespace='silk'))]
    
