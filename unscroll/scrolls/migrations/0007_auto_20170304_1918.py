# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-03-04 19:18
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('scrolls', '0006_auto_20170304_1915'),
    ]

    operations = [
        migrations.RenameField(
            model_name='contenttype',
            old_name='identifier',
            new_name='name',
        ),
        migrations.RenameField(
            model_name='mediatype',
            old_name='identifier',
            new_name='name',
        ),
    ]
