# Generated by Django 2.0.4 on 2018-06-18 15:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('scrolls', '0029_auto_20180615_0226'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='scroll',
            name='subtitle',
        ),
        migrations.AddField(
            model_name='notebook',
            name='is_fiction',
            field=models.BooleanField(default=False),
        ),
    ]
