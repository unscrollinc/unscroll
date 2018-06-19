from django.contrib import admin
from django.urls import path
from django.conf.urls import url, include
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.conf import settings
from django.conf.urls.static import static
from django.db import IntegrityError
import django_filters
from django.db.models import Max, Min, Count
from rest_framework import pagination, generics, serializers, viewsets, routers, response, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.exceptions import APIException
from scrolls.models import User, Scroll, Event, Notebook, Note, Media, Thumbnail
from unscroll.thumbnail import InboundThumbnail
from rest_framework_swagger.views import get_swagger_view
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

# Scrolls, Events, Notebooks, Notes
# User
# User lists their SENNs
# 

# ##############################
# Thumbnails
# ##############################


# class CreateListModelMixin(object):

#     def get_serializer(self, *args, **kwargs):
#         """ if an array is passed, set serializer to many """
#         if isinstance(kwargs.get('data', {}), list):
#             kwargs['many'] = True
#         return super(CreateListModelMixin, self).get_serializer(*args, **kwargs)


class ThumbnailSerializer(serializers.HyperlinkedModelSerializer):
    image = serializers.ImageField(
        max_length=None,
        allow_empty_file=False,
        use_url=False)
    
    class Meta:
        
        model = Thumbnail
        fields = (
            'url',
            'by_user',
            'sha1',
            'width',
            'height',
            'image',
            'source_url')

    def create(self, validated_data):
        validated_data['by_user'] = self.context['request'].user
        s = Thumbnail(**validated_data)
        s.save()
        return s

    
class ThumbnailViewSet(viewsets.ModelViewSet):
    queryset = Thumbnail.objects.all()
    serializer_class = ThumbnailSerializer
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)
    filter_fields = ('source_url',)

    @action(detail=False, methods=['post'])
    def upload(self, request):
        sha1=None
        try:
            f = request.data['file']
            t = InboundThumbnail(content=f.read())
            sha1=t.sha1
            s = Thumbnail(
                by_user=self.request.user,
                image=t.img_filename,
                width=t.width,
                height=t.height,
                sha1=t.sha1)
            s.save()
            serializer = ThumbnailSerializer(s, context={'request': request})
            return Response(serializer.data)
            
        except IntegrityError as e:
            s = Thumbnail.objects.get(sha1=t.sha1)
            serializer = ThumbnailSerializer(s, context={'request': request})
            return Response(serializer.data)
        # raise APIException('[urls.py error] {}'.format(e))

        except KeyError:
            raise APIException('[urls.py error] Request has no resource file attached')

    @action(detail=False, methods=['post'])
    def cache(self, request):
        sha1=None
        try:
            u = request.data['url']
            t = InboundThumbnail(url=u)
            sha1=t.sha1
            s = Thumbnail(
                by_user=self.request.user,
                image=t.img_filename,
                width=t.width,
                height=t.height,
                sha1=t.sha1)
            s.save()
            serializer = ThumbnailSerializer(s, context={'request': request})
            return Response(serializer.data)
            
        except IntegrityError as e:
            s = Thumbnail.objects.get(sha1=t.sha1)
            serializer = ThumbnailSerializer(s, context={'request': request})
            return Response(serializer.data)
        # raise APIException('[urls.py error] {}'.format(e))

        except KeyError:
            raise APIException('[urls.py error] Request has no resource file attached')        
        

    def perform_create(self, serializer):
        source_url = serializer.initial_data['source_url']
        t = InboundThumbnail(url=source_url)
        serializer.save(
            source_url=source_url,
            by_user=self.request.user,
            image_location=t.img_filename,
            width=t.width,
            height=t.height,
            sha1=t.sha1)


        
# ##############################
# Events
# ##############################
class EventFilter(django_filters.rest_framework.FilterSet):
    start = django_filters.IsoDateTimeFilter(
        name='when_happened',
        lookup_expr='gte')
    before = django_filters.IsoDateTimeFilter(
        name='when_happened',
        lookup_expr='lt')
    in_scroll = django_filters.UUIDFilter(
        name="in_scroll__uuid")

    q = django_filters.CharFilter(method='filter_by_q', distinct=True)

    # TODO THIS THING IS FRANKLY REAL DODGY
    def filter_by_q(self, queryset, WHAT_IS_THIS_ARG_I_DO_NOT_KNOW, value):
        uq = unquote(value)
        apos = re.sub("'", "", uq)
        filtered_val = "'{}'".format(apos,)
        return queryset.full_text_search(filtered_val)

    class Meta:
        model = Event
        fields = ['start', 'before', 'in_scroll', ]


class EventSerializer(serializers.HyperlinkedModelSerializer):
    user_username = serializers.CharField(
        read_only=True,
        source="by_user.username")
    
    class Meta:
        model = Event
        depth = 0
        fields = '__all__'        
        read_only_fields = (
            'uuid',
            'by_user',
            'user_username',)

        
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

    with_thumbnail = serializers.CharField(
        read_only=True,
        source="with_thumbnail.image")

    scroll_with_thumbnail = serializers.CharField(
        read_only=True,
        source="in_scroll.with_thumbnail.image")


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
            'with_thumbnail',
            'scroll_with_thumbnail',            
            'when_created',
            'title',
            'text',
            'ranking',
            'media_type',
            'content_type',
            'resolution',
            'when_happened',
            'when_original',            
            'content_url',
            'source_name',
            'source_url')
        read_only_fields = ('uuid', 'by_user',)
        list_serializer_class = BulkListSerializer

    def create(self, validated_data):
        validated_data['by_user'] = self.context['request'].user
        s = Event(**validated_data)
        try:
            s.save()
            es = Event.objects.get(id=s.id)
            return es            
        except IntegrityError as e:
            # print('[urls.py IntegrityError] {}'.format(e,))
            es = Event.objects.get(
                by_user=validated_data['by_user'],
                in_scroll=validated_data['in_scroll'],
                title=validated_data['title'],
                source_url=validated_data['source_url'],)
            return es

class BulkEventViewSet(BulkModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = Event.objects.select_related('in_scroll',
                                            'by_user')\
                            .filter(in_scroll__is_public=True)
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)
    filter_class = EventFilter
    serializer_class = BulkEventSerializer

    @action(detail=True)
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
    

# ##############################
# NOTES
# ##############################
class NoteSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = Note
        fields = (
            'id',
            'url',
            'order',            
            'uuid',
            'in_notebook',
            'by_user',
            'with_event',
            'kind',
            'when_created',
            'when_modified',
            'text',)

    def create(self, validated_data):
        validated_data['by_user'] = self.context['request'].user
        s = Note(**validated_data)
        s.save()
        return s


class NoteEventSerializer(serializers.HyperlinkedModelSerializer):
    event = EventSerializer(
        source='with_event',
        many=False,
        read_only=True)

    class Meta:
        model = Note
        fields = (
            'id',
            'url',            
            'order',
            'uuid',
            'in_notebook',
            'by_user',
            'event',
            'kind',            
            'when_created',
            'when_modified',
            'text',)



class NoteViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]    
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    ordering_fields = ('order',)
    ordering = ('order',)

class NoteFilter(django_filters.rest_framework.FilterSet):
    in_notebook = django_filters.UUIDFilter(
        name="notebook__uuid")
    
    class Meta:
        model = Note
        fields = ['in_notebook', ]

##############################
# Scrolls
##############################

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


class NotebookFilter(django_filters.rest_framework.FilterSet):
    class Meta:
        model = Notebook
        fields = ['uuid', 'title', 'by_user__username']


class NotebookSerializer(serializers.HyperlinkedModelSerializer):
    user_username = serializers.CharField(
        read_only=True,
        source="by_user.username")

    id = serializers.IntegerField(
        read_only=True)
    
    class Meta:
        model = Notebook
        depth = 0
        fields = '__all__'
        read_only_fields = (
            'uuid',
            'by_user',
            'user_username',)
        
    def create(self, validated_data):
        validated_data['by_user'] = self.context['request'].user
        n = Notebook(**validated_data)
        try:
            n.save()
            return n
        except Exception as e:
            raise APIException(str(e))        


class NotebookNotesSerializer(NotebookSerializer):
    full_notes = NoteEventSerializer(read_only=True, many=True)
    
class NotebookViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = NotebookSerializer
    filter_class = NotebookFilter
    queryset = Notebook.objects.filter(is_public=True)
    
    # Need to override only-public filter here so we use a custom destroy    
    def destroy(self, request, *args, **kwargs):
        self.queryset = Notebook.objects.all()    
        instance = self.get_object()
        if instance.by_user == request.user:
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(status=status.HTTP_404_NOT_FOUND)        

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        self.queryset = Notebook.objects.all()           
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)
   
    @action(detail=True)
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
    full_notebooks = NotebookSerializer(User.full_notebooks, many=True)    

    class Meta:
        model = User
        fields = (
            'url',
            'username',
            'email',
            'full_scrolls',
            'full_notebooks',            
            'is_staff')


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]

    @action(detail=False)
    def scrolls(self, request):
        user = self.request.user
        scrolls = Scroll.objects\
                        .select_related('by_user')\
                        .filter(by_user__id=user.id)\
                        .annotate(
                            event_count=Count('events'),
                            first_event=Min('events__when_happened'),
                            last_event=Max('events__when_happened'))
        serializer = ScrollSerializer(
            scrolls,
            context={'request': request},
            many=True)
        return Response(serializer.data)

    @action(detail=False)
    def notebooks(self, request):
        user = self.request.user
        notebooks = Notebook.objects\
                          .select_related('by_user')\
                          .filter(by_user__id=user.id)\
                          .annotate(note_count=Count('notes'))
        serializer = NotebookSerializer(
            notebooks,
            context={'request': request},
            many=True)
        return Response(serializer.data)

    @action(detail=True)
    def notebook(self, request, pk=None):
        user = self.request.user
        notebook = Notebook.objects.get(uuid=str(pk))
        notes = Note.objects\
                          .select_related('with_event')\
                          .filter(by_user__id=user.id)\
                          .filter(in_notebook=notebook.id)
        serializer = NotebookNotesSerializer(
            notebook,
            context={'request': request},
            many=False)
        return Response(serializer.data)

# Routers provide a way of automatically determining the URL conf.
router = BulkRouter()
# router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'scrolls', ScrollViewSet)
router.register(r'notebooks', NotebookViewSet)
router.register(r'thumbnails', ThumbnailViewSet)
router.register(r'events', BulkEventViewSet)
router.register(r'notes', NoteViewSet)

schema_view = get_swagger_view(title='Unscroll API')

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    url('^$', schema_view),
    url(r'', include(router.urls)),
    path('admin/', admin.site.urls),
    url(r'^auth/', include('djoser.urls')),
    url(r'^auth/', include('djoser.urls')),
    url(r'^auth/', include('djoser.urls.authtoken')),
    
] + static(settings.STATIC_URL,
           document_root=settings.STATIC_ROOT)

urlpatterns += [url(r'^silk/', include('silk.urls', namespace='silk'))]
    
