# -*- coding: utf-8 -*-
# Generated by Django 1.11.1 on 2017-05-20 14:17
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('scrolls', '0010_auto_20170515_1512'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='NoteMedia',
            new_name='Media',
        ),
        migrations.AlterModelOptions(
            name='media',
            options={'ordering': ['note__order']},
        ),
        migrations.AlterModelTable(
            name='event',
            table='event',
        ),
        migrations.AlterModelTable(
            name='media',
            table='media',
        ),
        migrations.AlterModelTable(
            name='note',
            table='note',
        ),
        migrations.AlterModelTable(
            name='scroll',
            table='scroll',
        ),
        migrations.AlterModelTable(
            name='thumbnail',
            table='thumbnail',
        ),
    ]