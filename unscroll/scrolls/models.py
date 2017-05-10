from django.db import models
from django.contrib.auth.models import User
from random import random
import uuid


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

    def __unicode__(self):
        return '{}'.format(self.image_location,)


class Scroll(models.Model):
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
    thumbnail = models.ForeignKey(
        Thumbnail,
        related_name='scrolls',
        null=True)
    deleted = models.BooleanField(
        default=False)

    class Meta:
        ordering = ['-created']

    def __unicode__(self):
        return '{}'.format(self.title,)


class Event(models.Model):
    """"""
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
        default=random())
    datetime = models.DateTimeField(
        db_index=True)
    resolution = models.CharField(
        max_length=32,
        default='days')
    source_url = models.URLField(
        null=True)
    source_date = models.CharField(
        max_length=128,
        null=True)
    content_url = models.URLField(
        max_length=512,
        null=True)
    thumbnail = models.ForeignKey(
        Thumbnail,
        related_name='events',
        null=True)
    deleted = models.BooleanField(
        default=False)    

    class Meta:
        ordering = ['-ranking', 'datetime']

    def __unicode__(self):
        return '{}'.format(self.title,)


class Note(models.Model):
    """"""
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
    text = models.TextField(
        blank=True,
        null=True)
    created = models.DateTimeField(
        auto_now_add=True)
    deleted = models.BooleanField(
        default=False)
    last_updated = models.DateTimeField(
        auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __unicode__(self):
        return '{}'.format(self.text,)


class NoteMedia(models.Model):
    """"""
    note = models.ForeignKey(
        Note,
        related_name="media")
    media_type = models.CharField(
        max_length=128,
        blank=True)
    media_file = models.FileField(
        upload_to=None)

    def __unicode__(self):
        return '{}'.format(self.media_file,)
