# Backend

This project was generated with Django (https://www.djangoproject.com/) version 2.0.3.

## Installation

1. Download project
```
git clone https://github.com/timotejgale/smrpo-backend
```

2. Create virtual environment
```
1. mkdir smrpo-backend-venv
2. cd smrpo-backend-venv
3. Install Python 3.5.2
4. Install virtualenv that you can create isolated Python environment (pip install virtualenv).
5. Create a virtual environment for a project: virtualenv -p /usr/bin/python3.5 .
6. Activate environmet: source bin/activate
```
3. Install Django and rest_framework
```
1. pip install django
2. pip install djangorestframework
```

## Database setup
Move to smrpo-backend folder and run `python manage.py migrate`.

## Create an admin user
python manage.py createsuperuser

## Start the development server

Run `python manage.py runserver` from smrpo-backend folder for a dev server. Navigate to `http://localhost:8000/admin`. 
