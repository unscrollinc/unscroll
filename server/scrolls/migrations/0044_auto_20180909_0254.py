# Generated by Django 2.0.4 on 2018-09-09 02:54

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('scrolls', '0043_auto_20180820_1341'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='event',
            unique_together={('by_user', 'in_scroll', 'title', 'content_url')},
        ),
    ]
