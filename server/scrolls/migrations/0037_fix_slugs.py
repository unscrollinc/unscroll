# Generated by Django 2.0.4 on 2018-08-02 16:57

from django.db import migrations, models, transaction
from django.utils.crypto import get_random_string

class Migration(migrations.Migration):

    dependencies = [
        ('scrolls', '0036_auto_20180802_1657'),
    ]

    def gen_slug(apps, schema_editor):
        MyModel = apps.get_model('scrolls', 'Scroll')
        with transaction.atomic():
            for row in MyModel.objects.all():
                row.slug = get_random_string(12,'abcdefghijklmnopqrstuvwxyz')
                row.save()
    
    operations = [
        migrations.RunPython(gen_slug)
    ]
