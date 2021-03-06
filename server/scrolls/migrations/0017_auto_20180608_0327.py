# Generated by Django 2.0.4 on 2018-06-08 03:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('scrolls', '0016_auto_20180608_0241'),
    ]

    operations = [
        migrations.AlterField(
            model_name='thumbnail',
            name='image',
            field=models.ImageField(height_field='height', null=True, upload_to='img', width_field='width'),
        ),
        migrations.AlterField(
            model_name='thumbnail',
            name='source_url',
            field=models.URLField(max_length=512),
        ),
    ]
