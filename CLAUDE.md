# Important points to be always loaded in context
- Use context7 mcp tool extensively.
- Use sub agents extensively whenever possible to get the task done in a separate context.

# Full Application Architecture - The Big Picture
- A react chatbot on the UI (this project) that talks to
- A python fastapi backend talks to 
    - Multiple MCP servers to get their resources and tools
    - And there is a Google Gemini LLM 2.5 flash