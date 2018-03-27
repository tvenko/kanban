release: python manage.py makemigrations backend
release: python manage.py migrate
web: gunicorn smrpo_backend.wsgi --log-file -
