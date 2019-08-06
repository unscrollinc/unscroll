FROM nginx:alpine
MAINTAINER Paul Ford <ford@ftrain.com>

VOLUME ["/unscrollg"]
WORKDIR /unscroll

ADD assets client config doc server tasks unscroll/

RUN apk update
RUN apk add python3 python3-dev py3-pip py3-psycopg2 py3-gunicorn py3-django py3-pillow py3-cryptography
RUN pip3 install --upgrade pip
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
	xmltodict
