# Generated by Django 2.0.4 on 2018-06-12 14:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('scrolls', '0021_auto_20180611_1515'),
    ]

    operations = [
        migrations.AlterField(
            model_name='event',
            name='content_type',
            field=models.CharField(db_index=True, default='event', max_length=128),
        ),
    ]
