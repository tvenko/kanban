from rest_framework.views import APIView
from rest_framework.response import Response
from . models import User
from . serializers import UserSerializer
# Create your views here.

class UserList(APIView):

    def get(self, request):
        user1 = User.objects.all()
        serializer = UserSerializer(user1, many=True)
        return Response(serializer.data)

    def post(self, request):

        pass