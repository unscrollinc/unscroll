# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-04-22 12:57
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('scrolls', '0009_auto_20170422_0221'),
    ]

    operations = [
        migrations.AlterField(
            model_name='thumbnail',
            name='image_location',
            field=models.CharField(max_length=128, null=True, unique=True),
        ),
        migrations.AlterField(
            model_name='thumbnail',
            name='sha1',
            field=models.CharField(max_length=64, null=True, unique=True),
        ),
    ]
