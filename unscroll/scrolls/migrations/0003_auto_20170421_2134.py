# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2017-04-21 21:34
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('scrolls', '0002_auto_20170416_1452'),
    ]

    operations = [
        migrations.AddField(
            model_name='event',
            name='content_type',
            field=models.CharField(default='event', max_length=128),
        ),
        migrations.AddField(
            model_name='event',
            name='thumbnail_url',
            field=models.URLField(max_length=512, null=True),
        ),
        migrations.AddField(
            model_name='event',
            name='user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='events', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='event',
            name='content_url',
            field=models.URLField(max_length=512, null=True),
        ),
    ]
