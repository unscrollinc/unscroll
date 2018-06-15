# Generated by Django 2.0.4 on 2018-06-12 20:23

from django.db import migrations, models
import django_bleach.models


class Migration(migrations.Migration):

    dependencies = [
        ('scrolls', '0022_auto_20180612_1419'),
    ]

    operations = [
        migrations.AlterField(
            model_name='event',
            name='citation',
            field=django_bleach.models.BleachField(null=True),
        ),
        migrations.AlterField(
            model_name='event',
            name='resolution',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='event',
            name='text',
            field=django_bleach.models.BleachField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='event',
            name='title',
            field=django_bleach.models.BleachField(),
        ),
        migrations.AlterField(
            model_name='notebook',
            name='description',
            field=django_bleach.models.BleachField(null=True),
        ),
        migrations.AlterField(
            model_name='notebook',
            name='subtitle',
            field=django_bleach.models.BleachField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='notebook',
            name='title',
            field=django_bleach.models.BleachField(),
        ),
        migrations.AlterField(
            model_name='scroll',
            name='citation',
            field=django_bleach.models.BleachField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='scroll',
            name='description',
            field=django_bleach.models.BleachField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='scroll',
            name='subtitle',
            field=django_bleach.models.BleachField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='scroll',
            name='title',
            field=django_bleach.models.BleachField(),
        ),
    ]