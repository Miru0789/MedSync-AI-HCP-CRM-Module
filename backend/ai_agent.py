"""
LangGraph AI Agent for HCP CRM.
Orchestrates AI tools for logging, editing, summarizing, and generating insights.
"""

import os
from typing import Annotated, List, Union, TypedDict, Literal, Optional
from datetime import date, datetime

from langchain_groq import ChatGroq
from langchain_core.messages import BaseMessage, HumanMessage, ToolMessage, SystemMessage
from langchain_core.tools import tool
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from sqlalchemy.orm import Session

import database
import crud
import schemas
import config

# ── LLM Setup ───────────────────────────────────────────────────────────────
llm = ChatGroq(
    api_key=config.GROQ_API_KEY,
    model_name=config.LLM_PRIMARY_MODEL,
    temperature=0.1
)

# ── Tool Definitions ─────────────────────────────────────────────────────────

@tool
def log_interaction_tool(
    doctor_name: str,
    hospital: Optional[str] = None,
    interaction_type: str = "Visit",
    notes: Optional[str] = None,
    products_discussed: Optional[str] = None,
    sentiment: str = "Neutral",
    follow_up_date: Optional[str] = None
):
    """
    Log a new interaction with an HCP. 
    Dates should be in YYYY-MM-DD format.
    Sentiment should be Positive, Neutral, or Negative.
    """
    db = next(database.get_db())
    try:
        # Convert date string to date object if exists
        f_date = None
        if follow_up_date:
            try:
                f_date = datetime.strptime(follow_up_date, "%Y-%m-%d").date()
            except:
                pass

        interaction_data = schemas.InteractionCreate(
            doctor_name=doctor_name,
            hospital=hospital,
            interaction_type=interaction_type,
            notes=notes,
            products_discussed=products_discussed,
            sentiment=sentiment,
            follow_up_date=f_date
        )
        # We use the summarization logic here too
        if notes and len(notes) > 50:
            interaction_data.summary = summarize_text(notes)
        else:
            interaction_data.summary = notes

        result = crud.create_interaction(db, interaction_data)
        return {"status": "success", "id": result.id, "extracted": interaction_data.dict()}
    finally:
        db.close()

@tool
def edit_interaction_tool(interaction_id: int, **updates):
    """
    Edit an existing interaction by ID. Updates can include doctor_name, hospital, notes, follow_up_date, etc.
    """
    db = next(database.get_db())
    try:
        # Handle date conversion if follow_up_date is in updates
        if "follow_up_date" in updates and updates["follow_up_date"]:
             updates["follow_up_date"] = datetime.strptime(updates["follow_up_date"], "%Y-%m-%d").date()
        
        update_schema = schemas.InteractionUpdate(**updates)
        result = crud.update_interaction(db, interaction_id, update_schema)
        if result:
            return {"status": "success", "message": "Interaction updated"}
        return {"status": "error", "message": "Interaction not found"}
    finally:
        db.close()

@tool
def summarization_tool(text: str):
    """Summarize long discussion notes into a concise sentence."""
    return summarize_text(text)

def summarize_text(text: str):
    summary_llm = ChatGroq(api_key=config.GROQ_API_KEY, model_name="llama-3.1-8b-instant", temperature=0)
    msg = summary_llm.invoke(f"Summarize this HCP interaction notes in 1 short sentence: {text}")
    return msg.content

@tool
def reminder_tool(interaction_id: int, reminder_date: str):
    """Add or update a follow-up reminder for an interaction."""
    db = next(database.get_db())
    try:
        r_date = datetime.strptime(reminder_date, "%Y-%m-%d").date()
        crud.create_reminder(db, interaction_id, r_date)
        return {"status": "success", "message": f"Reminder set for {reminder_date}"}
    finally:
        db.close()

@tool
def hcp_insights_tool():
    """Get overall analytics and insights for HCP interactions."""
    db = next(database.get_db())
    try:
        insights = crud.get_insights(db)
        return insights
    finally:
        db.close()

tools = [log_interaction_tool, edit_interaction_tool, summarization_tool, reminder_tool, hcp_insights_tool]
llm_with_tools = llm.bind_tools(tools)

# ── Agent State and Logic ────────────────────────────────────────────────────

class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], lambda x, y: x + y]

def call_model(state: AgentState):
    messages = state['messages']
    response = llm_with_tools.invoke(messages)
    return {"messages": [response]}

def call_tools(state: AgentState):
    last_message = state['messages'][-1]
    tool_node = ToolNode(tools)
    return tool_node.invoke(state)

def should_continue(state: AgentState):
    last_message = state['messages'][-1]
    if last_message.tool_calls:
        return "tools"
    return END

# ── Define Graph ─────────────────────────────────────────────────────────────

workflow = StateGraph(AgentState)

workflow.add_node("agent", call_model)
workflow.add_node("tools", call_tools)

workflow.set_entry_point("agent")
workflow.add_conditional_edges(
    "agent",
    should_continue,
    {
        "tools": "tools",
        END: END
    }
)
workflow.add_edge("tools", "agent")

app = workflow.compile()

# ── Helper function to run the agent ─────────────────────────────────────────

async def process_chat(message: str):
    if config.GROQ_API_KEY == "your_groq_api_key_here" or not config.GROQ_API_KEY:
        import asyncio
        await asyncio.sleep(1.5)
        return {
            "reply": "I've extracted the details from your message. Please review the structured overview on the right and click 'Complete & Sync Log'. \n*(Note: This is a simulated response because no Groq API Key was found in your .env file)*",
            "extracted_data": {
                "doctor_name": "Dr. Sarah Miller",
                "hospital": "Demo General Hospital",
                "interaction_type": "Visit",
                "notes": "Discussed patient adoption rates for HeartCare Plus. " + message,
                "products_discussed": "HeartCare Plus, Nexium",
                "follow_up_date": date.today().strftime("%Y-%m-%d")
            }
        }
    
    current_date = date.today().strftime("%Y-%m-%d")
    system_msg = SystemMessage(content=f"""
    You are a helpful CRM assistant for Pharmaceutical Sales Reps.
    Current date is {current_date}.
    User can log interactions, edit them, or ask for insights.
    If the user describes an interaction like "Met Dr. Smith at City Hospital, discussed HeartCare, follow up next Friday",
    extract the details: doctor_name, hospital, interaction_type, notes/discussion, sentiment (Positive, Neutral, Negative), and follow_up_date (calculate it based on today {current_date}).
    Then call log_interaction_tool.
    
    If user wants to edit, ask for ID if not provided, or call edit_interaction_tool.
    If user wants insights, call hcp_insights_tool.
    Always reply naturally to the user.
    """)
    
    inputs = {"messages": [system_msg, HumanMessage(content=message)]}
    result = await app.ainvoke(inputs)
    
    last_msg = result['messages'][-1]
    
    # Check if a tool was called to extract data for form auto-fill
    extracted_data = None
    for msg in result['messages']:
        if hasattr(msg, 'tool_calls') and msg.tool_calls:
            for tc in msg.tool_calls:
                if tc['name'] == 'log_interaction_tool':
                    extracted_data = tc['args']
    
    return {
        "reply": last_msg.content if last_msg.content else "Action completed.",
        "extracted_data": extracted_data
    }
