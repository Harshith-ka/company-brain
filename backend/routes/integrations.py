from fastapi import APIRouter, HTTPException
from models import GitHubPRAuditRequest, GitHubPRAuditResponse, SlackCommandRequest, SlackCommandResponse
from services.integration_service import integration_service

router = APIRouter(prefix="/api/integrations", tags=["Enterprise Integrations"])

@router.post("/github/audit-pr", response_model=GitHubPRAuditResponse)
async def audit_github_pull_request(request: GitHubPRAuditRequest):
    try:
        res = await integration_service.audit_github_pr(request)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GitHub PR audit error: {str(e)}")

@router.post("/slack/events", response_model=SlackCommandResponse)
async def handle_slack_webhook(request: SlackCommandRequest):
    try:
        res = await integration_service.handle_slack_command(request)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Slack event error: {str(e)}")
