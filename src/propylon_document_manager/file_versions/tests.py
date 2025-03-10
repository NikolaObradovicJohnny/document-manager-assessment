from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
from .models import FileVersion

User = get_user_model()

class DocumentAPITestCase(APITestCase):
    """Test cases for retrieving documents."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(email="test@example.com", password="testpass123")
        self.client.force_authenticate(user=self.user)  # Authenticate user for tests

        # Create test file
        test_file = SimpleUploadedFile("document1.pdf", b"Test content", content_type="application/pdf")

        # Create multiple versions of a file
        self.file_v1 = FileVersion.objects.create(
            file_name="document1.pdf",
            file_owner=self.user,
            version_number=1,
            file=test_file,
        )
        self.file_v2 = FileVersion.objects.create(
            file_name="document1.pdf",
            file_owner=self.user,
            version_number=2,
            file=test_file,
        )

        self.url_latest = f"/api/documents/{self.file_v1.file_name}/"
        self.url_specific = f"/api/documents/{self.file_v1.file_name}/?version=1"

    def test_get_latest_document(self):
        """Test retrieving the latest version of a document."""
        response = self.client.get(self.url_latest)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["file_name"], "document1.pdf")
        self.assertEqual(response.data["version_number"], 2)  # Latest version should be returned

    def test_get_specific_version(self):
        """Test retrieving a specific document version."""
        response = self.client.get(self.url_specific)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["file_name"], "document1.pdf")
        self.assertEqual(response.data["version_number"], 1)  # Version 1 should be returned

    def test_get_nonexistent_document(self):
        """Test retrieving a document that does not exist."""
        response = self.client.get("/api/documents/nonexistent.pdf/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_document_unauthenticated(self):
        """Test accessing documents without authentication."""
        self.client.logout()  # Remove authentication
        response = self.client.get(self.url_latest)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)  # Should be forbidden
