# Generated by Django 2.0.4 on 2018-06-08 04:04

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('scrolls', '0017_auto_20180608_0327'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='event',
            unique_together={('by_user', 'in_scroll', 'title', 'text')},
        ),
    ]
