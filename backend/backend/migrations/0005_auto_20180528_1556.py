# Generated by Django 2.0.3 on 2018-05-28 15:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0004_auto_20180423_1650'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cardlog',
            name='date',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]
