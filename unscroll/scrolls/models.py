from django.db import models
from django.db.models import Max, Min, Count
from django.contrib.auth.models import User
import uuid


class User(User):
    class Meta:
        proxy = True

    def full_scrolls(self):
        return Scroll.objects\
                     .select_related('user')\
                     .filter(user__id=self.id, public=True)\
                     .annotate(
                         event_count=Count('events'),
                         first_event=Min('events__datetime'),
                         last_event=Max('events__datetime'))


class Thumbnail(models.Model):
    """Thumbnail images."""
    user = models.ForeignKey(
        User,
        null=True,
        related_name='thumbnails')
    sha1 = models.CharField(
        max_length=64,
        unique=True,
        null=True)
    width = models.IntegerField(
        null=True)
    height = models.IntegerField(
        null=True)
    image_location = models.CharField(
        max_length=128,
        unique=True,
        null=True)
    source_url = models.URLField(
        max_length=512,
        unique=True,
        null=False)

    class Meta:
        db_table = 'thumbnail'

    def __unicode__(self):
        return '{}'.format(self.image_location,)


class Scroll(models.Model):
    """A scroll is a bag of Events and Notes controlled by a single user."""
    user = models.ForeignKey(
        User,
        null=True,
        related_name='scrolls')
    uuid = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True)
    publish_datetime = models.DateTimeField(
        null=True)
    public = models.BooleanField(
        default=False)
    created = models.DateTimeField(
        auto_now_add=True)
    last_modified = models.DateTimeField(
        auto_now=True)
    title = models.TextField()
    subtitle = models.TextField(
        blank=True, null=True)
    description = models.TextField(
        null=True)
    citation = models.TextField(
        null=True)
    thumbnail = models.ForeignKey(
        Thumbnail,
        related_name='scrolls',
        null=True)
    deleted = models.BooleanField(
        default=False)

    class Meta:
        db_table = 'scroll'
        unique_together = (("title", "user"),)
        ordering = ['-created']

    def __unicode__(self):
        return '{}'.format(self.title,)


class EventQueryset(models.QuerySet):
    def full_text_search(self, text):
        return self.extra(
            select={
                'rank':
                "ts_rank_cd(to_tsvector('english', scrolls_event.title || "
                + "' ' || scrolls_event.text), plainto_tsquery(%s), 32)"},
            select_params=(text,),
            where=("to_tsvector('english', scrolls_event.title || "
                   + "' ' || scrolls_event.text) @@ plainto_tsquery(%s)",),
            params=(text,),
            order_by=('-rank',)
        )


class Event(models.Model):
    """
    An event is something that happened approximately at a moment in
    time.
    """
    user = models.ForeignKey(
        User,
        null=True,
        related_name='events')
    uuid = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True)
    scroll = models.ForeignKey(
        Scroll,
        related_name='events')
    created = models.DateTimeField(
        auto_now_add=True)
    media_type = models.CharField(
        max_length=128,
        default="text/html")
    content_type = models.CharField(
        max_length=128,
        default="event")
    title = models.TextField(
        blank=False)
    text = models.TextField(
        blank=True,
        null=True)
    ranking = models.FloatField(
        db_index=True,
        default=0)
    datetime = models.DateTimeField(
        db_index=True)
    resolution = models.CharField(
        max_length=32,
        default='days')
    content_url = models.URLField(
        max_length=512,
        null=True)
    citation = models.TextField(
        null=True)        
    source_name = models.CharField(
        max_length=512,
        blank=True,
        null=True)
    source_url = models.URLField(
        max_length=512,
        null=True)    
    thumbnail = models.ForeignKey(
        Thumbnail,
        related_name='events',
        null=True)
    deleted = models.BooleanField(
        default=False)

    objects = EventQueryset.as_manager()

    class Meta:
        # unique_together = (("user", "title", "text"),)
        db_table = 'event'
        ordering = ['-ranking', 'datetime']

    def __unicode__(self):
        return '{}'.format(self.title,)


class Note(models.Model):
    """
    A Note is...a note. It can be a note on a scroll, or a note on an
    event. When you add up notes together and put them into order by
    their order field, you can see that as an essay or article, if you
    want.
    """
    user = models.ForeignKey(
        User,
        null=True,
        related_name="notes")
    uuid = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True)
    scroll = models.ForeignKey(
        Scroll,
        null=True,
        related_name="notes")
    event = models.ForeignKey(
        Event,
        null=True,
        related_name="notes")
    order = models.FloatField(
        blank=False)
    point = models.TextField(
        blank=True,
        null=True)
    text = models.TextField(
        blank=True,
        null=True)
    kind = models.CharField(
        max_length=128,
        default='default')
    created = models.DateTimeField(
        auto_now_add=True)
    deleted = models.BooleanField(
        default=False)
    last_updated = models.DateTimeField(
        auto_now_add=True)

    class Meta:
        db_table = 'note'
        ordering = ['order']

    def __unicode__(self):
        return '{}'.format(self.text,)


class Media(models.Model):
    """
    We upload things and always hang them off of a Note instance.
    """
    note = models.ForeignKey(
        Note,
        related_name="media")
    media_type = models.CharField(
        max_length=128,
        blank=True)
    media_file = models.FileField(
        upload_to=None)

    class Meta:
        db_table = 'media'
        ordering = ['note__order']

    def __unicode__(self):
        return '{}'.format(self.media_file,)
