from django.db import models
from django.contrib.auth.models import User
#from django import requests
import uuid

# Create your models here.

class MediaType(models.Model):
    identifier = models.CharField(max_length=128,
                                  primary_key=True)
    title = models.CharField(max_length=128)

class ContentType(models.Model):
    identifier = models.CharField(max_length=32,
                                  primary_key=True)
    title = models.CharField(max_length=32)
    
class Scroll(models.Model):
    user = models.ForeignKey(User,null=True)
    publish_datetime = models.DateTimeField(null=True)
    public = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=128)
    description = models.TextField(null=True)
    
class Event(models.Model):
    scroll = models.ForeignKey(Scroll)
    created = models.DateTimeField(auto_now_add=True)
    mediatype = models.CharField(max_length=128,
                                 default="text/html")
    title = models.CharField(max_length=128)
    text = models.TextField()
    datetime = models.DateTimeField(db_index=True)
    source_url = models.URLField(null=True)
    source_date = models.CharField(max_length=128, null=True)
    content_url = models.URLField(null=True)
    
class Note(models.Model):
    user = models.ForeignKey(User,null=True)    
    scroll = models.ForeignKey(Scroll)
    event = models.ForeignKey(Event)
    order = models.FloatField()
    text = models.TextField()
    display_type = models.ForeignKey(ContentType)
    created = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now_add=True)

class NoteMedia(models.Model):
    note = models.ForeignKey(Note)
    media_type = models.ForeignKey(MediaType)    
    media_file = models.FileField(upload_to=None)

    
