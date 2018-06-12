# Generated by Django 2.0.4 on 2018-06-12 21:30

from django.db import migrations, models
import django_bleach.models


class Migration(migrations.Migration):

    dependencies = [
        ('scrolls', '0027_auto_20180612_2126'),
    ]

    operations = [
        migrations.AlterField(
            model_name='event',
            name='citation',
            field=django_bleach.models.BleachField(blank=True, default=''),
        ),
        migrations.AlterField(
            model_name='event',
            name='source_name',
            field=models.CharField(blank=True, default='', max_length=512),
        ),
        migrations.AlterField(
            model_name='event',
            name='source_url',
            field=models.URLField(blank=True, default='', max_length=512),
        ),
        migrations.AlterField(
            model_name='event',
            name='text',
            field=django_bleach.models.BleachField(blank=True, default=''),
        ),
        migrations.AlterField(
            model_name='event',
            name='when_original',
            field=models.CharField(blank=True, default='', max_length=128),
        ),
    ]
