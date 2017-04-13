# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-04-09 02:27
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('scrolls', '0011_auto_20170305_2034'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='event',
            options={'ordering': ['-ranking']},
        ),
        migrations.AddField(
            model_name='event',
            name='resolution',
            field=models.CharField(default='DAY', max_length=32),
        ),
        migrations.AlterField(
            model_name='event',
            name='ranking',
            field=models.FloatField(db_index=True, default=0),
        ),
    ]