# Generated by Django 2.0.4 on 2018-06-08 02:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('scrolls', '0014_event_original_when'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='thumbnail',
            name='image_location',
        ),
        migrations.AddField(
            model_name='thumbnail',
            name='image',
            field=models.ImageField(default=None, height_field=models.IntegerField(null=True), upload_to=None, width_field=models.IntegerField(null=True)),
            preserve_default=False,
        ),
    ]
