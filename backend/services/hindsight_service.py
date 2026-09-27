import os
import json
import re
import math
from typing import List, Dict, Any, Optional
from models import MemoryItem, EvidenceItem
from config import settings

class HindsightMemoryService:
    def __init__(self):
        self.memory_file = settings.PERSISTENT_MEMORY_PATH
        self.memories: Dict[str, MemoryItem] = {}
        self.demo_stage: int = 3  # Default full memory
        self._load_from_disk()

    def _load_from_disk(self):
        if os.path.exists(self.memory_file):
            try:
                with open(self.memory_file, "r", encoding="utf-8") as f:
                    raw_data = json.load(f)
                    for item in raw_data:
                        self.memories[item["id"]] = MemoryItem(**item)
            except Exception as e:
                print(f"[Hindsight] Error loading memory store from disk: {e}")
        
        # If memory store is empty, initialize from novastack_dataset.json
        if not self.memories and os.path.exists(settings.DATA_PATH):
            self.seed_from_dataset()

    def save_to_disk(self):
        try:
            os.makedirs(os.path.dirname(self.memory_file), exist_ok=True)
            with open(self.memory_file, "w", encoding="utf-8") as f:
                json.dump([m.model_dump() for m in self.memories.values()], f, indent=2)
        except Exception as e:
            print(f"[Hindsight] Error saving memory store to disk: {e}")

    def seed_from_dataset(self):
        try:
            with open(settings.DATA_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)

            # Ingest ADRs as decisions
            for adr in data.get("decisions", []):
                mem = MemoryItem(
                    id=f"MEM-{adr['id']}",
                    title=f"Architecture Decision: {adr['title']}",
                    type="architecture_decision",
                    project=adr["project"],
                    technology=adr["technology"],
                    author=", ".join(adr.get("authors", ["Architecture Team"])),
                    date=adr["date"],
                    event=f"Architecture proposal for {adr['technology']} in {adr['project']}",
                    context=adr["reason"],
                    decision=adr["decision"],
                    action=f"Adopted {adr['technology']} for {adr['project']}",
                    outcome=adr["actual_outcome"],
                    lesson=adr["lessons_learned"],
                    summary=f"Decision to adopt {adr['technology']}. Outcome: {adr['actual_outcome']}. Lesson: {adr['lessons_learned']}",
                    tags=[adr["category"].lower(), adr["technology"].lower(), adr["project"].lower(), "adr", adr["status"].lower()],
                    source_id=adr["id"],
                    source_type="adr",
                    confidence_score=0.98,
                    metadata={"alternatives": adr["alternatives_considered"], "status": adr["status"]}
                )
                self.memories[mem.id] = mem

            # Ingest Incidents as incident experiences
            for inc in data.get("incidents", []):
                mem = MemoryItem(
                    id=f"MEM-{inc['id']}",
                    title=f"Incident: {inc['title']}",
                    type="engineering_incident",
                    project=inc["system"],
                    technology=inc.get("system", "").split("&")[0].strip(),
                    author=inc["lead_responder"],
                    date=inc["date"],
                    event=f"Outage/Degradation in {inc['system']} ({inc['severity']})",
                    context=inc["symptoms"],
                    decision=f"Emergency remediation led by {inc['lead_responder']}",
                    action="; ".join(inc["actions_taken"]),
                    outcome=inc["resolution"] + f" (Impact: {inc['impact']})",
                    lesson=inc["lessons_learned"],
                    summary=f"Incident in {inc['system']}. Root Cause: {inc['root_cause']}. Lesson: {inc['lessons_learned']}",
                    tags=["incident", inc["severity"].lower(), inc["system"].lower(), "outage", "postmortem"],
                    source_id=inc["id"],
                    source_type="incident",
                    confidence_score=0.99,
                    metadata={"root_cause": inc["root_cause"], "related_adrs": inc.get("related_adrs", [])}
                )
                self.memories[mem.id] = mem

            # Ingest GitHub Issues
            for gh in data.get("github_issues", []):
                mem = MemoryItem(
                    id=f"MEM-{gh['id']}",
                    title=f"GitHub {gh['type']}: {gh['title']}",
                    type="github_issue",
                    project="Core Platform",
                    technology=gh["tags"][0] if gh.get("tags") else "General",
                    author=gh["author"],
                    date=gh["date"],
                    event=f"{gh['type']} {gh['id']} filed by {gh['author']}",
                    context=gh["title"],
                    decision=f"Status: {gh['status']}",
                    action=f"Processed with tags: {', '.join(gh.get('tags', []))}",
                    outcome=f"Merged / Completed ({gh['status']})",
                    lesson=f"Tracked in engineering workflow under {gh['id']}",
                    summary=gh["title"],
                    tags=gh.get("tags", []) + ["github", gh["type"].lower()],
                    source_id=gh["id"],
                    source_type="github",
                    confidence_score=0.90
                )
                self.memories[mem.id] = mem

            self.save_to_disk()
            print(f"[Hindsight] Initialized memory store with {len(self.memories)} persistent memories.")
        except Exception as e:
            print(f"[Hindsight] Error seeding memory from dataset: {e}")

    def set_demo_stage(self, stage: int):
        """
        Demo Stages:
        Stage 1: Cold Start (Zero memory of Redis or historical incidents)
        Stage 2: Early Stage (Only initial ADR-002 Redis introduction)
        Stage 3: Full Stage (Complete historical memory, incidents INC-101, ADR-006, ADR-020)
        """
        self.demo_stage = stage

    def get_all_memories(self) -> List[MemoryItem]:
        all_mems = list(self.memories.values())
        if self.demo_stage == 1:
            # Filter out Redis and related memory completely
            return [m for m in all_mems if "redis" not in m.technology.lower() and "redis" not in m.title.lower()]
        elif self.demo_stage == 2:
            # Only include initial Redis ADR-002, filter out subsequent INC-101 and ADR-006
            return [m for m in all_mems if m.source_id not in ["INC-101", "ADR-006", "ADR-020", "GH-102", "GH-103", "GH-110"]]
        return all_mems

    def get_memory(self, memory_id: str) -> Optional[MemoryItem]:
        return self.memories.get(memory_id)

    def store_memory(self, memory: MemoryItem) -> MemoryItem:
        self.memories[memory.id] = memory
        self.save_to_disk()
        return memory

    def search_memories(self, query: str, limit: int = 8, project_filter: Optional[str] = None) -> List[MemoryItem]:
        """
        Semantic and lexical scoring across persistent memories.
        """
        active_memories = self.get_all_memories()
        
        # Tokenize query
        query_tokens = set(re.findall(r'\w+', query.lower()))
        
        scored_memories = []
        for mem in active_memories:
            if project_filter and project_filter.lower() not in mem.project.lower():
                continue

            score = 0.0
            searchable_text = f"{mem.title} {mem.technology} {mem.project} {mem.summary or ''} {mem.lesson or ''} {mem.context or ''} {mem.decision or ''} {mem.outcome or ''} {' '.join(mem.tags)}".lower()
            
            # Match token occurrences
            matched_count = 0
            for token in query_tokens:
                if len(token) <= 2 and token not in ["db", "ui", "ai", "s3", "k8s", "io"]:
                    continue
                if token in searchable_text:
                    matched_count += 1
                    # Higher weight for technology, title, or lessons
                    if token in mem.technology.lower():
                        score += 5.0
                    if token in mem.title.lower():
                        score += 4.0
                    if mem.lesson and token in mem.lesson.lower():
                        score += 3.0
                    score += 1.5

            if matched_count > 0:
                # Add recency boost and confidence boost
                score *= mem.confidence_score
                scored_memories.append((score, mem))

        scored_memories.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored_memories[:limit]]

    def find_similar_experiences(self, problem_description: str, limit: int = 5) -> List[MemoryItem]:
        return self.search_memories(problem_description, limit=limit)

    def extract_evidence(self, memories: List[MemoryItem]) -> List[EvidenceItem]:
        evidence_list = []
        for m in memories:
            snippet = m.lesson or m.outcome or m.summary or m.decision or m.title
            ev = EvidenceItem(
                id=m.id,
                title=m.title,
                type=m.type,
                technology=m.technology,
                relevance_reason=f"Historical record from {m.date} ({m.type.replace('_', ' ').title()})",
                citation_snippet=snippet,
                date=m.date,
                source_id=m.source_id
            )
            evidence_list.append(ev)
        return evidence_list

hindsight_service = HindsightMemoryService()
