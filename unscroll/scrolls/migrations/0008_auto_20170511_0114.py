# -*- coding: utf-8 -*-
# Generated by Django 1.11.1 on 2017-05-11 01:14
from __future__ import unicode_literals

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('scrolls', '0007_auto_20170510_1958'),
    ]

    operations = [
        migrations.AlterField(
            model_name='event',
            name='ranking',
            field=models.FloatField(db_index=True, default=0.14407016638430536),
        ),
        migrations.AlterField(
            model_name='event',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
        ),
        migrations.AlterField(
            model_name='note',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
        ),
        migrations.AlterField(
            model_name='scroll',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
        ),
    ]
