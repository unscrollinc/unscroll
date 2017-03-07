# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-03-05 20:15
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('scrolls', '0008_auto_20170304_1940'),
    ]

    operations = [
        migrations.AlterField(
            model_name='event',
            name='scroll',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='scroll', to='scrolls.Scroll'),
        ),
    ]