from django.db import models
from django.db.models import Max, Min, Count
from django_bleach.models import BleachField
from django.contrib.auth.models import User

from uuid import uuid4
import lxml.html
from lxml.html.clean import Cleaner

class User(User):
    class Meta:
        proxy = True

    def full_name(self):
        if (self.last_name and self.first_name):
            return "{} {}".format(self.first_name, self.last_name)
        if (self.first_name and not(self.last_name)):
            return self.first_name
        if (self.last_name and not(self.first_name)):
            return self.last_name
        return self.username
    
    def full_scrolls(self):
        return Scroll.objects\
                     .select_related('by_user')\
                     .filter(by_user__id=self.id, is_public=True)\
                     .annotate(
                         event_count=Count('events'),
                         first_event=Min('events__when_happened'),
                         last_event=Max('events__when_happened'))
    
    def full_notebooks(self):
        return Notebook.objects\
                     .select_related('by_user')\
                     .filter(by_user__id=self.id, is_public=True)\
                     .annotate(event_count=Count('notes'))

    # Use FAST topics vs Wikipedia topics?
    # Always add room for Wikipedia links
# class Topic(models.Model):
#    """Topic hierarchy."""
#    by_user = models.ForeignKey(
#        User,
#        null=True,
#        related_name='thumbnails',
#        on_delete=models.CASCADE)
#    # books published
#    # topics
#    # 

class Thumbnail(models.Model):
    """Thumbnail images."""
    by_user = models.ForeignKey(
        User,
        null=True,
        related_name='thumbnails',
        on_delete=models.CASCADE)
    sha1 = models.CharField(
        max_length=64,
        unique=True,
        null=True)
    width = models.IntegerField(
        null=True)
    height = models.IntegerField(
        null=True)
    image = models.ImageField(
        null=True,
        upload_to='img',
        height_field='height',
        width_field='width',
        max_length=100)
    source_url = models.URLField(
        max_length=512,
        unique=False,
        null=False)

    class Meta:
        db_table = 'thumbnail'

    def __unicode__(self):
        return '{}'.format(self.image_location,)


class Scroll(models.Model):
    """A scroll is a bag of Events controlled by a single user."""
    by_user = models.ForeignKey(
        User,
        null=True,
        related_name='scrolls',
        on_delete=models.CASCADE)
    uuid = models.UUIDField(
        default=uuid4,
        db_index=True,                
        editable=False,
        unique=True)
    slug = models.SlugField(
        unique=True)
    title = BleachField()
    description = BleachField(
        blank=True,
        default="")
    citation = BleachField(
        blank=True,
        default="")
    link = models.URLField(
        blank=True,
        null=True)
    with_thumbnail = models.ForeignKey(
        Thumbnail,
        related_name='scrolls',
        on_delete=models.CASCADE,
        blank=True,
        null=True)
    when_published = models.DateTimeField(
        null=True)
    when_created = models.DateTimeField(
        auto_now_add=True)
    when_modified = models.DateTimeField(
        auto_now=True)
    is_public = models.BooleanField(
        default=False)
    is_fiction = models.BooleanField(
        default=False)
    is_deleted = models.BooleanField(
        default=False)
    meta_event_count = models.IntegerField(
        default=0)
    meta_first_event = models.DateTimeField(
        null=True)
    meta_last_event = models.DateTimeField(
        null=True)        

    class Meta:
        db_table = 'scroll'
        unique_together = (("title", "by_user"),)
        ordering = ['-when_modified']

    def __unicode__(self):
        return '{}'.format(self.title,)

    
class Notebook(models.Model):
    """A notebook is a bag of notes."""
    by_user = models.ForeignKey(
        User,
        null=True,
        related_name='notebooks',
        on_delete=models.CASCADE)
    uuid = models.UUIDField(
        default=uuid4,
        db_index=True,                
        editable=False,
        unique=True)
    title = BleachField()
    subtitle = BleachField(
        blank=True,
        default="")
    description = BleachField(
        blank=True,
        default="")
    when_published = models.DateTimeField(
        null=True)
    when_created = models.DateTimeField(
        auto_now_add=True)
    when_modified = models.DateTimeField(
        auto_now=True)
    is_public = models.BooleanField(
        default=False)
    is_fiction = models.BooleanField(
        default=False)
    is_deleted = models.BooleanField(
        default=False)
    
    class Meta:
        db_table = 'notebook'
        unique_together = (("title", "by_user"),)
        ordering = ['-when_modified']

    def full_notes(self):
        return Note.objects.filter(in_notebook__id=self.id)

    def __unicode__(self):
        return '{}'.format(self.title,)
    
class EventQueryset(models.QuerySet):
    def full_text_search(self, text):
        return self.extra(
            select={
                'rank':
                "ts_rank_cd(to_tsvector('english', event.title "
                + " || ' ' || event.content_type"
                + " || ' ' || coalesce(event.text,'')), to_tsquery(%s), 32)"},
            select_params=(text,),
            where=("to_tsvector('english', event.title "
                   + " || ' ' || event.content_type"                   
                   + " || ' ' || coalesce(event.text,'')) @@ to_tsquery(%s)",),
            params=(text,),
            order_by=('when_happened',)
        )


class Event(models.Model):
    """

    An event is something that happened at a moment in time.

    """
    in_scroll = models.ForeignKey(
        Scroll,
        related_name='events',
        on_delete=models.CASCADE)
    with_thumbnail = models.ForeignKey(
        Thumbnail,
        related_name='events',
        on_delete=models.CASCADE,                
        null=True)
    by_user = models.ForeignKey(
        User,
        null=True,
        related_name='events',
        on_delete=models.CASCADE)
    uuid = models.UUIDField(
        default=uuid4,
        db_index=True,                
        editable=False,
        unique=True)
    # Typically filtered text/html, could also be text/text, or something else.
    media_type = models.CharField(
        max_length=128,
        default="text/html")
    # The root content type. A tag. PR, etc.
    content_type = models.CharField(
        db_index=True,        
        max_length=128,
        default="event")
    title = BleachField(
        blank=False)
    text = BleachField(
        blank=True,
        default="")
    ranking = models.FloatField(
        db_index=True,
        default=0)
    resolution = models.IntegerField(
        default=0)
    content_url = models.URLField(
        max_length=512,
        blank=True,
        null=True)
    citation = BleachField(
        default="",
        blank=True,
        null=False)
    source_name = models.CharField(
        max_length=512,
        default="",
        blank=True)
    source_url = models.URLField(
        max_length=512,
        default="",
        db_index=True,
        blank=True)
    when_created = models.DateTimeField(
        auto_now_add=True)
    when_happened = models.DateTimeField(
        db_index=True)
    when_original = models.CharField(
        default="",
        max_length=128,
        blank=True)
    is_deleted = models.BooleanField(
        default=False)

    objects = EventQueryset.as_manager()

    class Meta:
        unique_together = (("by_user", "in_scroll", "title", "content_url"),)
        db_table = 'event'
        ordering = ['-ranking', '?']

    def __unicode__(self):
        return '{}'.format(self.title,)

class Note(models.Model):
    """
    A Note is...a note. It can be by itself or linked to an event. When
    you add up notes together and put them into order by their order
    field, you can see that as an essay or article, if you want.
    """
    by_user = models.ForeignKey(
        User,
        null=True,
        related_name="notes",
        on_delete=models.CASCADE)
    uuid = models.UUIDField(
        db_index=True,        
        default=uuid4,
        editable=True,
        unique=True)
    following_uuid = models.UUIDField(
        db_index=True,        
        default=None,
        editable=True,
        null=True,
        blank=True,
        unique=False)
    in_notebook = models.ForeignKey(
        Notebook,
        null=True,
        related_name="notes",
        on_delete=models.CASCADE)
    with_event = models.ForeignKey(
        Event,
        null=True,
        blank=True,
        related_name="notes",
        on_delete=models.CASCADE)
    order = models.FloatField(
        null=True,
        blank=True)
    text = BleachField(
        blank=True,
        null=True)
    kind = models.CharField(
        max_length=128,
        default='default')
    when_created = models.DateTimeField(
        auto_now_add=True)
    when_modified = models.DateTimeField(
        auto_now_add=True)
    is_deleted = models.BooleanField(
        default=False)

    class Meta:
        db_table = 'note'
        ordering = ['order']

    def __unicode__(self):
        return '{}'.format(self.text,)


class Media(models.Model):
    """
    We upload things and always hang them off of a Note instance.
    """
    in_note = models.ForeignKey(
        Note,
        on_delete=models.CASCADE,        
        related_name="media")
    media_type = models.CharField(
        max_length=128,
        blank=True)
    media_file = models.FileField(
        upload_to=None)

    class Meta:
        db_table = 'media'
        #ordering = ['note__order']

    def __unicode__(self):
        return '{}'.format(self.media_file,)
