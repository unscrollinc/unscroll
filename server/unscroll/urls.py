# HOPE YOU LIKE IMPORTS

# The usual suspects
import hashlib
import pprint
from baseconv import base36
from os import makedirs
from urllib.request import unquote
import re
import requests

# Welcome to Djangotown
from django.contrib import admin
from django.urls import path
from django.conf.urls import url, include
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.conf import settings
from django.conf.urls.static import static
from django.db.utils import IntegrityError
from django.db.models import Q
from django.shortcuts import get_object_or_404
import django_filters
from django_filters import rest_framework as filters
from django.db.models import Max, Min, Count
from django.utils.crypto import get_random_string

# Rest framework
from rest_framework import pagination, generics, serializers, viewsets, routers, response, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.exceptions import APIException, ValidationError
from rest_framework.pagination import LimitOffsetPagination
from rest_framework_bulk.routes import BulkRouter
from rest_framework_extensions.cache.decorators import (cache_response)
from rest_framework_extensions.key_constructor import bits
from rest_framework_extensions.key_constructor.constructors import (
    KeyConstructor
)
from rest_framework_swagger.views import get_swagger_view
from rest_framework_bulk import (
    BulkListSerializer,
    BulkModelViewSet,
    BulkSerializerMixin,
    ListBulkCreateUpdateDestroyAPIView,
)

# Unscroll stuff
from scrolls.models import User, Scroll, Event, Notebook, Note, Media, Thumbnail
from unscroll.thumbnail import InboundThumbnail

# ##############################
# Thumbnails
# ##############################

def _cache_key(view_instance, view_method,
                   request, args, kwargs):
    key = request.build_absolute_uri()
    print('Cache key: {}'.format(key))
    return key

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
    filter_backends = (filters.DjangoFilterBackend,)
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
        except KeyError:
            raise APIException('[urls.py error] Request has no resource file attached')
        except Exception as e:
            raise APIException(str(e))

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
        except KeyError:
            raise APIException('[urls.py error] Request has no resource file attached')        
        except Exception as e:
            raise APIException(str(e))        

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
class EventFilter(filters.FilterSet):

    start = django_filters.IsoDateTimeFilter(
        name='when_happened',
        lookup_expr='gte')

    before = django_filters.IsoDateTimeFilter(
        name='when_happened',
        lookup_expr='lte')

    order = django_filters.OrderingFilter(
        # tuple-mapping retains order
        fields = ['when_happened', 'ranking'])
    
    q = django_filters.CharFilter(method='filter_by_q', distinct=True)

    # TODO THIS THING IS FRANKLY REAL DODGY
    def filter_by_q(self, queryset, WHAT_IS_THIS_ARG_I_DO_NOT_KNOW, value):
        uq = unquote(value)
        apos = re.sub(r"[';]", "", uq)
        filtered_val = "'{}'".format(apos,)
        return queryset.full_text_search(filtered_val)

    class Meta:
        model = Event
        fields = ['start',
                  'before',
                  'q',
                  'in_scroll',
                  'in_scroll__slug',
                  'in_scroll__uuid',
                  'in_scroll__by_user__username']


class EventSerializer(serializers.HyperlinkedModelSerializer):
    user_username = serializers.CharField(
        read_only=True,
        source="by_user.username")
    
    user_full_name = serializers.CharField(
        read_only=True,
        source="by_user.full_name")        

    in_scroll_uuid = serializers.CharField(
        read_only=True,
        source="in_scroll.uuid")

    in_scroll_slug = serializers.CharField(
        read_only=True,
        source="in_scroll.slug")
    
    in_scroll_title = serializers.CharField(
        read_only=True,
        source="in_scroll.title")

    scroll_user_username = serializers.CharField(
        read_only=True,
        source="in_scroll.by_user.username")

    scroll_is_public = serializers.CharField(
        read_only=True,
        source="in_scroll.is_public")

    with_thumbnail_image = serializers.CharField(
        read_only=True,
        source="with_thumbnail.image")    

    
    class Meta:
        model = Event
        depth = 0
        fields = '__all__'        
        read_only_fields = (
            'uuid',
            'by_user',
            'user_full_name',
            'user_username',)

        
class BulkEventSerializer(BulkSerializerMixin,
                          serializers.HyperlinkedModelSerializer):
    
    scroll_title = serializers.CharField(
        read_only=True,
        source="in_scroll.title")
    
    scroll_uuid = serializers.UUIDField(
        read_only=True,
        source="in_scroll.uuid")

    in_scroll_slug = serializers.CharField(
        read_only=True,
        source="in_scroll.slug")

    in_scroll_user = serializers.UUIDField(
        read_only=True,
        source="in_scroll.by_user.username")

    username = serializers.CharField(
        read_only=True,
        source="by_user.username")


    user_full_name = serializers.CharField(
        read_only=True,
        source="by_user.full_name")    

    is_public = serializers.BooleanField(
        read_only=True,
        source="in_scroll.is_public")

    with_thumbnail_image = serializers.CharField(
        read_only=True,
        source="with_thumbnail.image")

    scroll_with_thumbnail = serializers.CharField(
        read_only=True,
        source="in_scroll.with_thumbnail.image")
    
    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = ('uuid', 'by_user',)
        list_serializer_class = BulkListSerializer

    def create(self, validated_data):
        try:
            validated_data['by_user'] = self.context['request'].user
            s = Event(**validated_data)
            s.save()
            es = Event.objects.get(id=s.id)
            return es            
        except Exception as e:
            raise APIException(str(e))

class EventPagination(pagination.LimitOffsetPagination):
    def paginate_queryset(self, queryset, request, view=None):
        self.first_event = queryset.aggregate(first_event=Min('when_happened'))['first_event']
        self.last_event = queryset.aggregate(last_event=Max('when_happened'))['last_event']        
        return super(EventPagination, self).paginate_queryset(queryset, request, view)

    def get_paginated_response(self, data):
        paginated_response = super(EventPagination, self).get_paginated_response(data)
        paginated_response.data['first_event'] = self.first_event
        paginated_response.data['last_event'] = self.last_event
        return paginated_response
   
 
class BulkEventViewSet(BulkModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = Event.objects.select_related('in_scroll',
                                            'by_user',
                                            'with_thumbnail')
    
    filter_backends = (filters.DjangoFilterBackend,)
    filter_class = EventFilter
    serializer_class = BulkEventSerializer

    @action(methods=['get'], detail=False)
    def minmax(self, request):
        qs = self.filter_queryset(self.get_queryset())
        aggregates = qs.aggregate(
            event_count=Count('*'),
            first_event=Min('when_happened'),
            last_event=Max('when_happened'))
        resp = dict({'query':request.query_params.get('q')},
                    **aggregates)
        return Response(resp)
    

    def get_queryset(self):
        user = self.request.user

        # Check if authed
        query = Q(in_scroll__is_public=True)        
        if user.is_authenticated:
            query = (Q(by_user=user) or Q(in_scroll__is_public=True))

        qs = self.queryset\
            .filter(query)        

        qsfiltered = self.filter_queryset(qs)
        return qsfiltered

#    @cache_response(key_func=_cache_key)
    def list(self, request):
        pagination_class = EventPagination
        paginator = pagination_class()


        page = paginator.paginate_queryset(
            self.get_queryset(),
            request)
        
        serializer = BulkEventSerializer(
            page,
            many=True,
            context={'request': request})
        return paginator.get_paginated_response(serializer.data)

# ##############################
# Notes
# ##############################

class NoteFilter(filters.FilterSet):
    class Meta:
        model = Note
        fields = ['in_notebook__id','in_notebook__uuid',]

        
class NoteEventSerializer(serializers.HyperlinkedModelSerializer):
    in_notebook_uuid = serializers.UUIDField(
        read_only=True,
        source="in_notebook.uuid")
    
    in_notebook_is_public = serializers.BooleanField(
        read_only=True,
        source="in_notebook.is_public")
    
    user_username = serializers.CharField(
        read_only=True,
        source="by_user.username")

    user_full_name = serializers.CharField(
        read_only=True,
        source="by_user.full_name")
    
    event = EventSerializer(
        source='with_event',
        many=False,
        read_only=True)

    class Meta:
        model = Note
        fields = '__all__'

    def create(self, validated_data):
        validated_data['by_user'] = self.context['request'].user
        s = Note(**validated_data)
        s.save()
        return s

        

class NoteViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = Note.objects.all()    
    serializer_class = NoteEventSerializer
    filter_class=NoteFilter

    def filter_private_event(self, note):
        username = self.request.user.username        
        e = note.get('event')
        # NOTE STRING COMPARISON WITH TRUE, this is happening post-serialization
        if (e and ((e.get('scroll_is_public') == 'True')
                 or (e.get('user_username') == username))):
            return note
        else:
            del note['event']
            return note

#    @cache_response(key_func=_cache_key)        
    def list(self, request):
        pagination_class = LimitOffsetPagination
        paginator = pagination_class()
        page = paginator.paginate_queryset(
            self.get_queryset(),
            request)

        serializer = NoteEventSerializer(
            page,
            many=True,
            context={'request': request})
        notes = [self.filter_private_event(note) for note in serializer.data]
        return paginator.get_paginated_response(notes)

    def retrieve(self, request, pk=None):
        note = get_object_or_404(
            self.get_queryset(),
            pk=pk)
        serializer = NoteEventSerializer(
            note,
            many=False,
            context={'request': request})
        note = self.filter_private_event(serializer.data)
        return Response(note)
    
    
    def get_queryset(self):
        queryset = self.queryset

        user = self.request.user

        # Check if authed
        query = Q(in_notebook__is_public=True)        
        if user.is_authenticated:
            query = (Q(by_user=user) or Q(in_notebook__is_public=True))
        qs = queryset.filter(query)
        qsfiltered = self.filter_queryset(qs)
        return qsfiltered
    

##############################
# Scrolls
##############################

class ScrollFilter(filters.FilterSet):
    class Meta:
        model = Scroll
        fields = ['uuid',
                  'slug',
                  'title',
                  'is_public',
                  'by_user__username']

class ScrollSerializer(serializers.HyperlinkedModelSerializer):
    user_username = serializers.CharField(
        read_only=True,
        source="by_user.username")
    
    user_full_name = serializers.CharField(
        read_only=True,
        source="by_user.full_name")    

    first_event = serializers.DateTimeField(
        read_only=True)

    last_event = serializers.DateTimeField(
        read_only=True)

    event_count = serializers.IntegerField(
        read_only=True)

    with_thumbnail_image = serializers.CharField(
        read_only=True,
        source="with_thumbnail.image")    

    class Meta:
        model = Scroll
        fields = '__all__'
        depth = 0
        read_only_fields = (
            'uuid',
            'slug',
            'by_user',
            'user_username',
            'user_fullname',
            'event_count',
            'first_event',
            'last_event',)

    def create(self, validated_data):
        validated_data['by_user'] = self.context['request'].user
        s = Scroll(**validated_data)
        try:
            s.slug = get_random_string(12,'abcdefghijklmnopqrstuvwxyz')            
            s.save()
            return s
        except IntegrityError as e:
            raise APIException('[urls.py error] {}'.format(str(e)))                                
        except Exception as e:
            raise APIException('[urls.py error] {}'.format(str(e)))                    


class ScrollViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = ScrollSerializer
    queryset = Scroll.objects.select_related('by_user', 'with_thumbnail')
    filter_backends = (filters.DjangoFilterBackend,)
    filter_class = ScrollFilter

    def get_queryset(self):
        user = self.request.user

        # Check if authed
        query = Q(is_public=True)        
        if user.is_authenticated:
            query = (Q(by_user=user) or Q(is_public=True))

        qs = self.queryset\
            .filter(query)\
            #.annotate(
                #event_count=Count('events'),
                #first_event=Min('events__when_happened'),
                #last_event=Max('events__when_happened'))

        qsfiltered = self.filter_queryset(qs)
        return qsfiltered
    
#    @cache_response(key_func=_cache_key)
    def list(self, request):
        pagination_class = LimitOffsetPagination
        paginator = pagination_class()
        page = paginator.paginate_queryset(
            self.get_queryset(),
            request)

        serializer = ScrollSerializer(
            page,
            many=True,
            context={'request': request})
        return paginator.get_paginated_response(serializer.data)
    

########################################
# Notebook
########################################

class NotebookFilter(filters.FilterSet):
    class Meta:
        model = Notebook
        fields = ['uuid',
                  'is_public',
                  'by_user__username']


class NotebookSerializer(serializers.HyperlinkedModelSerializer):
    # TODO
    whatever = serializers.PrimaryKeyRelatedField(
        pk_field=serializers.UUIDField(format='hex'),        
        many=False,
        read_only=True)
    
    user_username = serializers.CharField(
        read_only=True,
        source="by_user.username")

    user_full_name = serializers.CharField(
        read_only=True,
        source="by_user.full_name")
    
    note_count = serializers.IntegerField(
        read_only=True)
    
    id = serializers.IntegerField(
        read_only=True)
    
    class Meta:
        model = Notebook
        depth = 0
        fields = '__all__'
        read_only_fields = (
            'uuid',
            'id',
            'note_count',
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
        except Exception as e:
            raise APIException(str(e))        

class NotebookViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = NotebookSerializer
    queryset = Notebook.objects.all()
    filter_class = NotebookFilter
    
    def get_queryset(self):
        queryset = self.queryset
        user = self.request.user
        # Check if authed
        query = Q(is_public=True)     
        if user.is_authenticated:
            query = (Q(by_user=user) or Q(is_public=True))
            
        qs = queryset\
                      .filter(query)\
                      .annotate(note_count=Count('notes'))
        qsfiltered = self.filter_queryset(qs)
        return qsfiltered

#    @cache_response(key_func=_cache_key)
    def list(self, request):
        pagination_class = LimitOffsetPagination
        paginator = pagination_class()

        page = paginator.paginate_queryset(
            self.get_queryset(),
            request)
        serializer = NotebookSerializer(
            page,
            many=True,
            context={'request': request})
        return paginator.get_paginated_response(serializer.data)


class UserSerializer(serializers.HyperlinkedModelSerializer):
    full_scrolls = ScrollSerializer(User.full_scrolls, many=True)
    full_notebooks = NotebookSerializer(User.full_notebooks, many=True)    

    class Meta:
        model = User
        fields = (
            'url',
            'username',
            'full_name',            
            'full_scrolls',
            'full_notebooks',            
            'is_staff')

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]

# Routers provide a way of automatically determining the URL conf.
router = BulkRouter()
# router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'scrolls', ScrollViewSet)
router.register(r'events', BulkEventViewSet)
router.register(r'notebooks', NotebookViewSet)
router.register(r'notes', NoteViewSet)
router.register(r'thumbnails', ThumbnailViewSet)

schema_view = get_swagger_view(title='Unscroll API')

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    url('^api/$', schema_view),
    url(r'api/', include(router.urls)),
    path('api/admin/', admin.site.urls),
    url(r'^api/auth/', include('djoser.urls')),
    url(r'^api/auth/', include('djoser.urls.authtoken')),
    
] + static(settings.STATIC_URL,
           document_root=settings.STATIC_ROOT)

urlpatterns += [url(r'^api/silk/', include('silk.urls', namespace='silk'))]
    
