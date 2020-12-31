# -*- coding: utf-8 -*-
# Generated by Django 1.11.1 on 2018-04-21 15:46
from __future__ import unicode_literals

import django.contrib.auth.models
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0008_alter_user_username_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='Event',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('media_type', models.CharField(default='text/html', max_length=128)),
                ('content_type', models.CharField(default='event', max_length=128)),
                ('title', models.TextField()),
                ('text', models.TextField(blank=True, null=True)),
                ('ranking', models.FloatField(db_index=True, default=0)),
                ('resolution', models.CharField(default='days', max_length=32)),
                ('content_url', models.URLField(max_length=512, null=True)),
                ('citation', models.TextField(null=True)),
                ('source_name', models.CharField(blank=True, max_length=512, null=True)),
                ('source_url', models.URLField(max_length=512, null=True)),
                ('when_created', models.DateTimeField(auto_now_add=True)),
                ('when_happened', models.DateTimeField(db_index=True)),
                ('is_deleted', models.BooleanField(default=False)),
            ],
            options={
                'db_table': 'event',
                'ordering': ['-ranking', 'when_happened'],
            },
        ),
        migrations.CreateModel(
            name='Media',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('media_type', models.CharField(blank=True, max_length=128)),
                ('media_file', models.FileField(upload_to=None)),
            ],
            options={
                'db_table': 'media',
                #'ordering': ['note__order'],
            },
        ),
        migrations.CreateModel(
            name='Note',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('order', models.FloatField()),
                ('text', models.TextField(blank=True, null=True)),
                ('kind', models.CharField(default='default', max_length=128)),
                ('when_created', models.DateTimeField(auto_now_add=True)),
                ('when_modified', models.DateTimeField(auto_now_add=True)),
                ('is_deleted', models.BooleanField(default=False)),
            ],
            options={
                'db_table': 'note',
                'ordering': ['order'],
            },
        ),
        migrations.CreateModel(
            name='Scroll',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('title', models.TextField()),
                ('subtitle', models.TextField(blank=True, null=True)),
                ('description', models.TextField(null=True)),
                ('citation', models.TextField(null=True)),
                ('when_published', models.DateTimeField(null=True)),
                ('when_created', models.DateTimeField(auto_now_add=True)),
                ('when_modified', models.DateTimeField(auto_now=True)),
                ('is_public', models.BooleanField(default=False)),
                ('is_fiction', models.BooleanField(default=False)),
                ('is_deleted', models.BooleanField(default=False)),
            ],
            options={
                'db_table': 'scroll',
                'ordering': ['-when_modified'],
            },
        ),
        migrations.CreateModel(
            name='Thumbnail',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('sha1', models.CharField(max_length=64, null=True, unique=True)),
                ('width', models.IntegerField(null=True)),
                ('height', models.IntegerField(null=True)),
                ('image_location', models.CharField(max_length=128, null=True, unique=True)),
                ('source_url', models.URLField(max_length=512, unique=True)),
            ],
            options={
                'db_table': 'thumbnail',
            },
        ),
        migrations.CreateModel(
            name='User',
            fields=[
            ],
            options={
                'proxy': True,
                'indexes': [],
            },
            bases=('auth.user',),
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.AddField(
            model_name='thumbnail',
            name='by_user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='thumbnails', to='scrolls.User'),
        ),
        migrations.AddField(
            model_name='scroll',
            name='by_user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='scrolls', to='scrolls.User'),
        ),
        migrations.AddField(
            model_name='scroll',
            name='with_thumbnail',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='scrolls', to='scrolls.Thumbnail'),
        ),
        migrations.AddField(
            model_name='note',
            name='by_user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='notes', to='scrolls.User'),
        ),
        migrations.AddField(
            model_name='note',
            name='in_event',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='notes', to='scrolls.Event'),
        ),
        migrations.AddField(
            model_name='note',
            name='in_scroll',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='notes', to='scrolls.Scroll'),
        ),
        migrations.AddField(
            model_name='media',
            name='in_note',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='media', to='scrolls.Note'),
        ),
        migrations.AddField(
            model_name='event',
            name='in_scroll',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='events', to='scrolls.Scroll'),
        ),
        migrations.AddField(
            model_name='event',
            name='with_thumbnail',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='events', to='scrolls.Thumbnail'),
        ),
        migrations.AddField(
            model_name='event',
            name='with_user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='events', to='scrolls.User'),
        ),
        migrations.AlterUniqueTogether(
            name='scroll',
            unique_together=set([('title', 'by_user')]),
        ),
    ]
