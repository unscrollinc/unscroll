FROM alpine:3.12
MAINTAINER Paul Ford <ford@ftrain.com>

#VOLUME ["/unscrollg"]
EXPOSE 8000
WORKDIR /unscroll
ENV PYTHON_VERSION 3.8.7

COPY assets assets
COPY client client
COPY config config
COPY doc doc
COPY server server
COPY tasks tasks

RUN apk update
RUN apk add build-base python3 python3-dev py3-pip py3-psycopg2 py3-gunicorn py3-django py3-pillow py3-cryptography libressl-dev musl-dev libffi-dev py3-lxml postgresql-client
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

# can't make this happy with container paths for now, should run on startup
WORKDIR server
RUN ./manage.py migrate
RUN (crontab -l 2>/dev/null; echo "*/2 * * * * psql -f /unscroll/tasks/update_counts.sql")| crontab -
RUN ./runlocalgunicorn.sh&