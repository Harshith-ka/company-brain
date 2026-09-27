from fastapi import APIRouter
from models import GraphData, GraphNode, GraphEdge
from services.hindsight_service import hindsight_service
import json
import os
from config import settings

router = APIRouter(prefix="/api/graph", tags=["Memory Graph"])

@router.get("", response_model=GraphData)
async def get_memory_graph():
    memories = hindsight_service.get_all_memories()
    
    nodes_dict = {}
    edges = []
    
    # 1. Add core technology nodes
    tech_categories = {
        "Redis": "Caching",
        "PostgreSQL": "Database",
        "DynamoDB": "Database",
        "Kafka": "Messaging",
        "Kubernetes": "Infrastructure",
        "Hindsight": "AI Memory",
        "GraphQL": "API Gateway",
        "gRPC": "Networking",
        "Temporal.io": "Orchestration",
        "Vault": "Security"
    }
    
    for tech, cat in tech_categories.items():
        node_id = f"tech-{tech.lower()}"
        nodes_dict[node_id] = GraphNode(
            id=node_id,
            label=tech,
            type="technology",
            category=cat,
            data={"description": f"Core infrastructure technology ({cat})"}
        )
        
    # 2. Add Project nodes
    projects = ["Core Platform", "Recommendation Service", "Auth Service", "Project Nova"]
    for proj in projects:
        node_id = f"proj-{proj.lower().replace(' ', '-')}"
        nodes_dict[node_id] = GraphNode(
            id=node_id,
            label=proj,
            type="project",
            category="Project",
            data={"name": proj}
        )

    # 3. Add People nodes
    engineers = ["Elena Vance", "Priya Sharma", "Dave Chen", "Marcus Brody", "Alex Rivera", "Sarah Jenkins", "Zack Taylor"]
    for eng in engineers:
        node_id = f"person-{eng.lower().replace(' ', '-')}"
        nodes_dict[node_id] = GraphNode(
            id=node_id,
            label=eng,
            type="person",
            category="Engineer",
            data={"role": "NovaStack Engineering"}
        )

    # 4. Add Memory / Decision / Incident nodes and Edges
    for m in memories:
        m_node_id = f"node-{m.id}"
        node_type = "decision" if m.type == "architecture_decision" else ("incident" if m.type == "engineering_incident" else "memory")
        nodes_dict[m_node_id] = GraphNode(
            id=m_node_id,
            label=m.source_id or m.title[:25],
            type=node_type,
            category=m.type,
            data={"title": m.title, "date": m.date, "lesson": m.lesson, "outcome": m.outcome}
        )
        
        # Link memory to technology
        for tech in tech_categories.keys():
            if tech.lower() in m.technology.lower() or tech.lower() in m.title.lower():
                tech_node_id = f"tech-{tech.lower()}"
                edges.append(GraphEdge(
                    id=f"edge-{m_node_id}-{tech_node_id}",
                    source=m_node_id,
                    target=tech_node_id,
                    label="uses",
                    relation="USES_TECH"
                ))
                
        # Link memory to project
        for proj in projects:
            if proj.lower() in m.project.lower():
                proj_node_id = f"proj-{proj.lower().replace(' ', '-')}"
                edges.append(GraphEdge(
                    id=f"edge-{m_node_id}-{proj_node_id}",
                    source=m_node_id,
                    target=proj_node_id,
                    label="belongs to",
                    relation="BELONGS_TO"
                ))
                
        # Link memory to person/author
        for eng in engineers:
            if eng.lower() in (m.author or "").lower():
                eng_node_id = f"person-{eng.lower().replace(' ', '-')}"
                edges.append(GraphEdge(
                    id=f"edge-{m_node_id}-{eng_node_id}",
                    source=eng_node_id,
                    target=m_node_id,
                    label="authored / led",
                    relation="AUTHORED"
                ))

        # Add explicit causal links (e.g. INC-101 -> ADR-006 -> ADR-020)
        if m.source_id == "INC-101":
            edges.append(GraphEdge(
                id="edge-inc101-adr006",
                source="node-MEM-INC-101",
                target="node-MEM-ADR-006",
                label="triggered architectural review",
                relation="TRIGGERED_ADR"
            ))
            edges.append(GraphEdge(
                id="edge-adr002-inc101",
                source="node-MEM-ADR-002",
                target="node-MEM-INC-101",
                label="experienced outage in",
                relation="FAILED_IN"
            ))
        elif m.source_id == "ADR-006":
            edges.append(GraphEdge(
                id="edge-adr006-adr020",
                source="node-MEM-ADR-006",
                target="node-MEM-ADR-020",
                label="synthesized into",
                relation="SYNTHESIZED_INTO"
            ))
        elif m.source_id == "INC-102":
            edges.append(GraphEdge(
                id="edge-inc102-adr010",
                source="node-MEM-INC-102",
                target="node-MEM-ADR-010",
                label="resolved by",
                relation="RESOLVED_BY"
            ))

    return GraphData(
        nodes=list(nodes_dict.values()),
        edges=edges
    )
