# -*- coding: utf-8 -*-
# Generated by Django 1.11.1 on 2017-05-14 01:44
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('scrolls', '0002_auto_20170512_1822'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='event',
            name='source_date',
        ),
        migrations.RemoveField(
            model_name='event',
            name='source_url',
        ),
        migrations.AlterField(
            model_name='event',
            name='ranking',
            field=models.FloatField(db_index=True, default=0.8632863751875802),
        ),
    ]