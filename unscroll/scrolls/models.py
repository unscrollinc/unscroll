from django.db import models
from django.contrib.auth.models import User



class MediaType(models.Model):
    """"""
    name = models.CharField(max_length=128,
                            primary_key=True)

    def __unicode__(self):
        return '{}'.format(self.name,)


class ContentType(models.Model):
    """"""
    name = models.CharField(max_length=32,
                            primary_key=True)

    def __unicode__(self):
        return '{}'.format(self.name,)


class Scroll(models.Model):
    user = models.ForeignKey(User,
                             null=True,
                             related_name='scrolls')
    publish_datetime = models.DateTimeField(null=True)
    public = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)
    title = models.TextField()
    subtitle = models.TextField(blank=True)
    description = models.TextField(null=True)

    def __unicode__(self):
        return '{}'.format(self.title,)
    

class Thumbnail(models.Model):
    user = models.ForeignKey(User,
                             null=True,
                             related_name='thumbnails')
    sha1 = models.CharField(max_length=64)
    image_url = models.URLField(max_length=512, null=True)
    source_url = models.URLField(max_length=512, null=True)


class Event(models.Model):
    """"""
    user = models.ForeignKey(User,
                             null=True,
                             related_name='events')
    scroll = models.ForeignKey(Scroll,
                               related_name='events')
    created = models.DateTimeField(auto_now_add=True)
    mediatype = models.CharField(max_length=128,
                                 default="text/html")
    content_type = models.CharField(max_length=128,
                                    default="event")
    title = models.TextField(blank=False)
    text = models.TextField(blank=True, null=True)
    ranking = models.FloatField(db_index=True, default=0)
    datetime = models.DateTimeField(db_index=True)
    resolution = models.CharField(max_length=32, default='days')
    source_url = models.URLField(null=True)
    source_date = models.CharField(max_length=128, null=True)
    content_url = models.URLField(max_length=512, null=True)
    thumbnail = models.ForeignKey(Thumbnail,
                                  related_name='events',
                                  null=True)


    class Meta:
        ordering = ['-ranking', 'datetime']

    def __unicode__(self):
        return '{}'.format(self.title,)


class Note(models.Model):
    """"""
    user = models.ForeignKey(User,
                             null=True,
                             related_name="notes")
#    scroll = models.ForeignKey(Scroll, null=False, related_name="notes")
    event = models.ForeignKey(Event, null=True, related_name="notes")
    order = models.FloatField(default=0)
    text = models.TextField(null=True)
    display_type = models.ForeignKey(ContentType, null=True)
    created = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-order', 'created']

    def __unicode__(self):
        return '{}'.format(self.text,)


class NoteMedia(models.Model):
    """"""
    note = models.ForeignKey(Note, related_name="media")
    media_type = models.ForeignKey(MediaType)
    media_file = models.FileField(upload_to=None)
