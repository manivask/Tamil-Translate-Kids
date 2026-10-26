import os
import unittest
from unittest.mock import patch

import server


class ServerValidationTests(unittest.TestCase):
    def test_progress_requires_valid_student_and_ranges(self):
        good = {
            "student": {"firstName": "Test", "lastName": "Student", "grade": 3},
            "sentenceId": "G3-001",
            "category": "translation",
            "score": 100,
            "stars": 3,
            "passed": True,
        }
        self.assertIsNotNone(server.validate_progress(good))
        for change in (
            {"student": {"firstName": "", "lastName": "Student", "grade": 3}},
            {"student": {"firstName": "Test", "lastName": "Student", "grade": 9}},
            {"score": 101},
            {"stars": 4},
            {"passed": "true"},
            {"sentenceId": ""},
        ):
            invalid = {**good, **change}
            self.assertIsNone(server.validate_progress(invalid), change)

    def test_reading_material_validation(self):
        material = {
            "id": "test-material-1",
            "title": "Test lesson",
            "grade": "2",
            "sentences": [{"tamil": "வணக்கம்", "english": "Hello"}],
        }
        self.assertTrue(server.validate_material(material))
        self.assertFalse(server.validate_material({**material, "sentences": []}))
        self.assertFalse(server.validate_material({**material, "grade": 99}))
        self.assertFalse(server.validate_material({**material, "sentences": ["not an object"]}))

    def test_loopback_is_default_and_lan_requires_explicit_opt_in(self):
        with patch.dict(os.environ, {}, clear=True):
            self.assertEqual(server.configured_host(), "127.0.0.1")
        with patch.dict(os.environ, {"TBTA_HOST": "0.0.0.0"}, clear=True):
            with self.assertRaises(SystemExit):
                server.configured_host()
        with patch.dict(os.environ, {"TBTA_HOST": "0.0.0.0", "TBTA_ALLOW_INSECURE_LAN": "1"}, clear=True):
            self.assertEqual(server.configured_host(), "0.0.0.0")


if __name__ == "__main__":
    unittest.main()
