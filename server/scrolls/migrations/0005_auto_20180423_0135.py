# Generated by Django 2.0.4 on 2018-04-23 01:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('scrolls', '0004_auto_20180422_2013'),
    ]

    operations = [
        migrations.RenameField(
            model_name='event',
            old_name='with_user',
            new_name='by_user',
        ),
        migrations.AlterField(
            model_name='scroll',
            name='citation',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='scroll',
            name='link',
            field=models.URLField(blank=True, null=True),
        ),
    ]
