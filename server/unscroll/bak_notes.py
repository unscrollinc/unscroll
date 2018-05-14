
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
    event_full = BulkEventSerializer(
        source='event',
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
            'event_full',
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


class BulkNoteSerializer(BulkSerializerMixin,
                         serializers.HyperlinkedModelSerializer):

    event_full = BulkEventSerializer(
        source='event',
        many=False,
        read_only=True)

    is_public = serializers.BooleanField(
        read_only=True,
        source="notebook.is_public")

    notebook_uuid = serializers.UUIDField(
        read_only=True,
        source="notebook.uuid")

    class Meta(object):
        list_serializer_class = BulkListSerializer        
        model = Note
        update_lookup_field = 'id'
        fields = (
            'id',
            'url',
            'uuid',
            'in_notebook',
            'notebook_uuid',
            'kind',
            'is_public',
            'by_user',
            'with_event',
            'event_full',
            'order',
            'when_created',
            'when_modified',
            'text')


    def create(self, validated_data):
        validated_data['by_user'] = self.context['request'].user
        s = Note(**validated_data)
        s.save()
        return s

class NoteFilter(django_filters.rest_framework.FilterSet):
    in_notebook = django_filters.UUIDFilter(
        name="notebook__uuid")
    
    class Meta:
        model = Note
        fields = ['in_notebook', ]


class BulkNoteViewSet(BulkModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = Note.objects.select_related(
        'in_notebook',
        'with_event',
        'by_user')
    serializer_class = BulkNoteSerializer
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)
    filter_class = NoteFilter
