from graphene_django import DjangoObjectType
from scrolls.models import User as UserModel, Scroll as ScrollModel, Event as EventModel, Note as NoteModel
import graphene

class User(DjangoObjectType):
    class Meta:
        model = UserModel

class Scroll(DjangoObjectType):
    class Meta:
        model = ScrollModel

class Event(DjangoObjectType):
    class Meta:
        model = EventModel

#class Notebook(DjangoObjectType):
#    class Meta:
#        model = Notebook

class Note(DjangoObjectType):
    class Meta:
        model = NoteModel
        
class Query(graphene.ObjectType):
    users = graphene.List(User)
    scrolls = graphene.List(Scroll)
    events = graphene.List(Event)
    notes = graphene.List(Note)

    def resolve_users(self, info):
        return UserModel.objects.all()

schema = graphene.Schema(query=Query)
