from django.shortcuts import render
from django.db import models  # Add this import

from rest_framework.mixins import RetrieveModelMixin, ListModelMixin
from rest_framework.viewsets import GenericViewSet

from ..models import FileVersion
from .serializers import FileVersionSerializer
from .permissions import IsOwner

from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404

from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate

class CustomAuthToken(ObtainAuthToken):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        password = request.data.get("password")

        if email is None or password is None:
            return Response({"error": "Email and password are required."}, status=400)

        user = authenticate(email=email, password=password)
        if not user:
            return Response({"error": "Invalid email or password."}, status=400)

        token, created = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "user": email })


class FileVersionViewSet(RetrieveModelMixin, ListModelMixin, GenericViewSet):
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes = [IsAuthenticated, IsOwner] # [AllowAny]# 
    serializer_class = FileVersionSerializer
    queryset = FileVersion.objects.none()
    lookup_field = "id"

    def get_queryset(self):
        """Return only the latest version of files owned by the authenticated user."""
        if not self.request.user or self.request.user.is_anonymous:
            raise PermissionDenied("User is not authenticated")

        # Subquery to get the highest version_number for each file_name
        latest_versions = FileVersion.objects.filter(
            file_name=models.OuterRef("file_name"),
            file_owner=self.request.user
        ).order_by("-version_number").values("version_number")[:1]  # Get only 1 latest version

        return FileVersion.objects.filter(
            file_owner=self.request.user,
            version_number=models.Subquery(latest_versions)
        )

    def perform_create(self, serializer):
        """Assign the logged-in user as the file owner, but ensure the user is authenticated before saving."""
        if self.request.user.is_authenticated:
            serializer.save(file_owner=self.request.user)
        else:
            raise PermissionDenied("User is not authenticated")

class UploadDocumentView(APIView):
    """Handles document uploads with versioning and Content Addressable Storage (CAS)."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        file_name = request.data.get("file_name")
        file_owner = request.user

        latest_version = FileVersion.objects\
            .filter(file_name=file_name, file_owner=file_owner)\
            .aggregate(max_version=models.Max("version_number"))["max_version"] or 0
        new_version = latest_version + 1

        document_version = FileVersion(
            file_name=file_name,
            file_owner=file_owner,
            version_number=new_version,
            file=file
        )
        document_version.save()

        return Response(FileVersionSerializer(document_version).data, status=status.HTTP_201_CREATED)

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def upload_document(request):
    """Upload a document, versioned and stored using CAS."""
    file = request.FILES.get("file")
    if not file:
        return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

    file_name = request.data.get("file_name")
    file_owner = request.user
    # document_name = request.data.get("name")
    # document, _ = Document.objects.get_or_create(name=document_name, owner=request.user)

    latest_version = FileVersion.objects\
        .filter(file_name=file_name, file_owner=file_owner)\
        .aggregate(max_version=models.Max("version_number"))["max_version"] or 0
    new_version = latest_version + 1

    document_version = FileVersion(file_name=file_name, file_owner=file_owner, version_number=new_version, file=file)
    document_version.save()

    return Response(FileVersionSerializer(document_version).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def get_document(request, filename):
    """Retrieve a document by name and version (default: latest)."""
    version = request.GET.get("version", None)
    file_owner = request.user

    # Query files belonging to the user
    query = FileVersion.objects.filter(file_name=filename, file_owner=file_owner)

    if version:
        document_version = get_object_or_404(query, version_number=int(version))
    else:
        document_version = query.order_by("-version_number").first()  # Latest version

    if not document_version:
        return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = FileVersionSerializer(document_version)
    return Response(serializer.data)

@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def get_all_versions_of_document(request, filename):
    """Retrieve a document by name and all versions."""
    file_owner = request.user

    # Query files belonging to the user
    query = FileVersion.objects.filter(file_name=filename, file_owner=file_owner).order_by("-version_number")

    if not query:
        return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = FileVersionSerializer(query, many=True)
    return Response(serializer.data)

class TestAuthView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": "You are authenticated!", "user": str(request.user), "authenticated": request.user.is_authenticated})