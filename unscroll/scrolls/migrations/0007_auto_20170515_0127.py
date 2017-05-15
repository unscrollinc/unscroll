# -*- coding: utf-8 -*-
# Generated by Django 1.11.1 on 2017-05-15 01:27
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('scrolls', '0006_note_point'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='scroll',
            unique_together=set([('title', 'user')]),
        ),
    ]
