# Generated by Django 2.0.4 on 2018-05-10 18:44

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('scrolls', '0006_auto_20180430_0050'),
    ]

    operations = [
        migrations.AlterField(
            model_name='note',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, unique=True),
        ),
    ]
