from django.db import models
from django.contrib.auth.models import User
#from django import requests
import uuid

# Create your models here.

class MediaType(models.Model):
    name = models.CharField(max_length=128,
                                  primary_key=True)

    def __unicode__(self):
        return '{}'.format(name,)

class ContentType(models.Model):
    name = models.CharField(max_length=32,
                                  primary_key=True)

    def __unicode__(self):
        return '{}'.format(name,)    
    
class Scroll(models.Model):
    user = models.ForeignKey(User,null=True, related_name='scrolls')
    publish_datetime = models.DateTimeField(null=True)
    public = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)
    title = models.TextField()
    subtitle = models.TextField(blank=True)
    description = models.TextField(null=True)

    def __unicode__(self):
        return '{}'.format(title,)
    
class Event(models.Model):
    scroll = models.ForeignKey(Scroll, related_name='events')
    created = models.DateTimeField(auto_now_add=True)
    mediatype = models.CharField(max_length=128,
                                 default="text/html")
    title = models.CharField(max_length=128)
    text = models.TextField(blank=True)
    ranking = models.FloatField(default=0)
    datetime = models.DateTimeField(db_index=True)
    source_url = models.URLField(null=True)
    source_date = models.CharField(max_length=128, null=True)
    content_url = models.URLField(null=True)

    def __unicode__(self):
        return '{}'.format(title,)
    
class Note(models.Model):
    user = models.ForeignKey(User,null=True, related_name="notes")    
    event = models.ForeignKey(Event, null=True, related_name="notes")
    order = models.FloatField(default=0)
    text = models.TextField(null=True)
    display_type = models.ForeignKey(ContentType, null=True)
    created = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now_add=True)

    def __unicode__(self):
        return '{}'.format(text,)    

class NoteMedia(models.Model):
    note = models.ForeignKey(Note, related_name="media")
    media_type = models.ForeignKey(MediaType)    
    media_file = models.FileField(upload_to=None)

    
