# Generated by Django 2.0.4 on 2018-05-21 01:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('scrolls', '0011_remove_note_uuid_next'),
    ]

    operations = [
        migrations.AlterField(
            model_name='note',
            name='order',
            field=models.FloatField(blank=True),
        ),
    ]