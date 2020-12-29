FROM nginx:alpine
MAINTAINER Paul Ford <ford@ftrain.com>

VOLUME ["/unscrollg"]
WORKDIR /unscroll

ADD assets client config doc server tasks unscroll/

RUN apk update
RUN apk add build-base python3 python3-dev py3-pip py3-psycopg2 py3-gunicorn py3-django py3-pillow py3-cryptography libressl-dev musl-dev libffi-dev py3-lxml
RUN pip3 install --upgrade pip
RUN pip install wheel
RUN pip install \
	django-allauth \
	django-bleach \
	django-cors-headers \
	django-crispy-forms \
	django-debug-toolbar \
	django-filter \
	django-rest-auth \
	django-rest-knox \
	django-rest-swagger \
	django-silk \
	djangorestframework \
	djangorestframework-bulk \
	djoser \
	humanize \
	python-baseconv \
	python-dateutil \
	drf-extensions \
	base36 \
	xmltodict

# needed for https://github.com/chibisov/drf-extensions/issues/294
RUN sed -i -e 's/django.db.models.sql.datastructures/django.core.exceptions/g' /usr/lib/python3.8/site-packages/rest_framework_extensions/key_constructor/bits.py

# RUN cd /unscroll/server && gunicorn -w 6 --log-level DEBUG --bind 127.0.0.1:8000 unscroll.wsgi:application