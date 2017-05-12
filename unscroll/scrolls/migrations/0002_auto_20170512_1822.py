# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2017-05-12 18:22
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('scrolls', '0001_squashed_0008_auto_20170511_0114'),
    ]

    operations = [
        migrations.RunSQL(        
            "CREATE INDEX scrolls_scroll_ts_idx ON scrolls_scroll USING gin(to_tsvector('english', title || ' ' || subtitle || ' ' || description)); ",
            "CREATE INDEX scrolls_event_ts_idx ON scrolls_event USING gin(to_tsvector('english', title || ' ' || text));",
        )
    ]
