"""End-to-end backend tests for PromptCut.

Covers the full project lifecycle:
- create project -> upload -> transcribe -> chat -> messages -> edit_plan -> render -> output
- list projects
"""
from __future__ import annotations

import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Read from frontend/.env if not in env
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().strip('"').rstrip("/")
                    break
    except FileNotFoundError:
        pass

API = f"{BASE_URL}/api"
SAMPLE_VIDEO = "/tmp/sample.mp4"


# ---------- Shared fixtures ----------

@pytest.fixture(scope="module")
def session() -> requests.Session:
    s = requests.Session()
    return s


@pytest.fixture(scope="module")
def project_id(session: requests.Session) -> str:
    """Create a project + upload + transcribe once for the whole suite."""
    r = session.post(f"{API}/projects", json={"title": "Test"}, timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["title"] == "Test"
    assert isinstance(data["id"], str) and data["id"]
    return data["id"]


@pytest.fixture(scope="module")
def uploaded_project(session: requests.Session, project_id: str) -> str:
    """Upload sample video once."""
    with open(SAMPLE_VIDEO, "rb") as f:
        files = {"file": ("sample.mp4", f, "video/mp4")}
        r = session.post(f"{API}/projects/{project_id}/upload", files=files, timeout=120)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["has_video"] is True
    assert body["duration"] > 0
    return project_id


@pytest.fixture(scope="module")
def transcribed_project(session: requests.Session, uploaded_project: str) -> str:
    r = session.post(f"{API}/projects/{uploaded_project}/transcribe", timeout=180)
    assert r.status_code == 200, r.text
    body = r.json()
    assert "segments" in body and isinstance(body["segments"], list)
    return uploaded_project


# ---------- Tests (depend on fixtures above; ordered by name where possible) ----------

class TestProjectLifecycle:
    """Health + create + upload."""

    def test_health(self, session: requests.Session) -> None:
        r = session.get(f"{API}/", timeout=15)
        assert r.status_code == 200
        assert r.json().get("status") == "ok"

    def test_01_create_project(self, project_id: str) -> None:
        # Verify persistence via GET
        r = requests.get(f"{API}/projects/{project_id}", timeout=15)
        assert r.status_code == 200
        body = r.json()
        assert body["id"] == project_id
        assert body["title"] == "Test"
        assert body["has_video"] is False

    def test_02_upload_video(self, session: requests.Session, uploaded_project: str) -> None:
        r = session.get(f"{API}/projects/{uploaded_project}", timeout=15)
        assert r.status_code == 200
        body = r.json()
        assert body["has_video"] is True
        assert body["duration"] > 0
        # The sample is 8s
        assert 5.0 < body["duration"] < 15.0

    def test_03_transcribe(self, session: requests.Session, transcribed_project: str) -> None:
        # Already transcribed via fixture; verify status
        r = session.get(f"{API}/projects/{transcribed_project}", timeout=15)
        assert r.status_code == 200
        body = r.json()
        assert body["transcript_status"] == "done", body

    def test_04_get_transcript(self, session: requests.Session, transcribed_project: str) -> None:
        r = session.get(f"{API}/projects/{transcribed_project}/transcript", timeout=15)
        assert r.status_code == 200
        body = r.json()
        assert body["project_id"] == transcribed_project
        assert "segments" in body
        assert isinstance(body["segments"], list)
        assert "text" in body


class TestChatAndPlan:
    """Chat with Claude -> edit plan."""

    def test_05_chat_creates_edit_plan(
        self, session: requests.Session, transcribed_project: str
    ) -> None:
        msg = "Trim the first 2 seconds and make it vertical 9:16 and add captions"
        r = session.post(
            f"{API}/projects/{transcribed_project}/chat",
            json={"message": msg},
            timeout=120,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert "assistant" in body
        assert "edit_plan" in body
        plan = body["edit_plan"]
        # Aspect ratio
        assert plan["aspect_ratio"] == "9:16", plan
        # Captions enabled
        assert plan["captions"]["enabled"] is True, plan
        # Trim approx 2 (allow some flexibility)
        assert plan["trim"] is not None, plan
        assert abs(float(plan["trim"]["start"]) - 2.0) < 0.6, plan["trim"]

    def test_06_get_messages(self, session: requests.Session, transcribed_project: str) -> None:
        r = session.get(f"{API}/projects/{transcribed_project}/messages", timeout=15)
        assert r.status_code == 200
        msgs = r.json()
        assert isinstance(msgs, list)
        assert len(msgs) >= 2  # user + assistant
        roles = [m["role"] for m in msgs]
        assert "user" in roles and "assistant" in roles

    def test_07_get_edit_plan(self, session: requests.Session, transcribed_project: str) -> None:
        r = session.get(f"{API}/projects/{transcribed_project}/edit_plan", timeout=15)
        assert r.status_code == 200
        plan = r.json()
        assert plan["aspect_ratio"] == "9:16"
        assert plan["captions"]["enabled"] is True


class TestRender:
    """Render via ffmpeg + serve output."""

    def test_08_render(self, session: requests.Session, transcribed_project: str) -> None:
        r = session.post(f"{API}/projects/{transcribed_project}/render", timeout=300)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["status"] == "done", body

    def test_09_serve_output(self, session: requests.Session, transcribed_project: str) -> None:
        r = session.get(f"{API}/projects/{transcribed_project}/output", timeout=60)
        assert r.status_code == 200
        ctype = r.headers.get("content-type", "")
        assert "video/mp4" in ctype, ctype
        assert len(r.content) > 1000  # non-empty mp4


class TestListing:
    def test_10_list_projects(self, session: requests.Session, project_id: str) -> None:
        r = session.get(f"{API}/projects", timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        ids = [p["id"] for p in items]
        assert project_id in ids


class TestErrorHandling:
    def test_get_unknown_project_404(self, session: requests.Session) -> None:
        r = session.get(f"{API}/projects/does-not-exist-123", timeout=15)
        assert r.status_code == 404

    def test_output_before_render_404(self, session: requests.Session) -> None:
        r = session.post(f"{API}/projects", json={"title": "TEST_no_render"}, timeout=15)
        pid = r.json()["id"]
        r2 = session.get(f"{API}/projects/{pid}/output", timeout=15)
        assert r2.status_code == 404
