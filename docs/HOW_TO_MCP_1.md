# Building an MCP Server from Scratch (with a Little Help from GPT) | by Davin Hills | Medium

# Building an MCP Server from Scratch (with a Little Help from GPT)

[

![Davin Hills](https://miro.medium.com/v2/resize:fill:64:64/0*oxmaeynlEvTxLX92.jpg)





](/?source=post_page---byline--432f700b5e68---------------------------------------)

[Davin Hills](/?source=post_page---byline--432f700b5e68---------------------------------------)

Follow

4 min read

·

Apr 22, 2025

34

2

Listen

Share

More

![](https://miro.medium.com/v2/resize:fit:700/1*nNz-h-6YQSFZyauPGF5K6Q.png)

When I first set out to build an MCP server — short for **Model Context Protocol** — I wasn’t just chasing a new framework. I was chasing understanding.

I’ve found that _the best way to truly understand a system is to build it yourself._ And LLM orchestration — chaining tools, injecting context, retrieving memory, running prompts — is no exception. There are frameworks like LangChain and Semantic Kernel, but I wanted to see how it all actually works under the hood.

This article walks through how I built my own MCP server — what it does, how I structured it, and how GPT helped clarify architecture without ever taking the wheel.

## 🧠 What Is an MCP Server?

The goal of an MCP server is to abstract over common LLM-driven workflows:

-   Prompt execution with variable injection
-   Session tracking and context persistence
-   Calling tools (shell commands, APIs, or internal functions)
-   Searching memory — both vector and structured
-   Switching LLMs on demand (OpenAI, Claude, Ollama)

All via a clean JSON protocol that can be sent over HTTP or stdin/stdout.

In short, it’s _middleware for building intelligent, contextual LLM applications._

## 🔧 Why I Built It From Scratch

The main reason? **To learn.** I wanted to deeply understand how these systems are wired together.

Rather than use a full-stack orchestration framework and fill in blanks, I wanted to _fill in the architecture_ — how prompt templates are resolved, how tools are tracked, how memory integrates into workflows, and how async jobs should behave.

Along the way I built something lightweight, Go-native, dependency-minimal, and extensible. Here’s how.

## 🧱 Core Architecture

![](https://miro.medium.com/v2/resize:fit:700/1*zFY_59Bn-PhQ28Yx9eApCg.png)

## 📦 Protocol Overview

Each request looks like this:

{  
  "id": "req-001",  
  "method": "runPrompt",  
  "params": {  
    "prompt": "summarize",  
    "input": "This is a long passage..."  
  }  
}

Each method is dispatched to a handler registered in a map:

type methodHandler func(\*Server, mcp.Request) mcp.Response

var handlers = map\[string\]methodHandler{  
	"runPrompt":      (\*Server).handleRunPrompt,  
	"callTool":       (\*Server).handleCallTool,  
	"callToolAsync":  (\*Server).handleCallToolAsync,  
	"getToolResult":  (\*Server).handleGetToolResult,  
	"getMemory":      (\*Server).handleGetMemory,  
	"searchMemory":   (\*Server).handleSearchMemory,  
}

## 🧩 Server Loop

For stdin mode (CLI), I use a loop that reads from a JSON decoder and dispatches asynchronously:

func (s \*Server) Start() error {  
	for {  
		var req mcp.Request  
		if err := s.dec.Decode(&req); err != nil {  
			if err == io.EOF {  
				time.Sleep(100 \* time.Millisecond)  
				continue  
			}  
			return fmt.Errorf("decode failed: %w", err)  
		}  
		go s.handle(req)  
	}  
}

HTTP mode uses the same dispatch pattern via POST /mcp.

## 🧠 Prompt Execution

Prompts are simple Go templates stored in a prompts/ directory:

prompts/  
  summarize.txt  
  classify\_risk.txt  
  answer\_question.txt

Each prompt is rendered with context merged from:

-   Input params
-   Session memory
-   Retrieved vector memory
-   Tool outputs (if needed)

func (s \*Server) handleRunPrompt(req mcp.Request) mcp.Response {  
	params := req.Params.(map\[string\]any)  
	name := params\["prompt"\].(string)  
	data := extractTemplateVars(params)  
	tmpl, err := s.prompts.Load(name)  
	content := tmpl.Render(data)

	result, err := s.llmClient.Complete(ctx, content)  
	...  
}

## 🔌 Tool Execution

Tools are modular and registered at startup. They can be shell commands, Go functions, or remote APIs:

type Tool interface {  
	Name() string  
	Run(ctx context.Context, args \[\]string) (ToolResult, error)  
}

type ShellTool struct {  
	Command string  
}func (s ShellTool) Run(ctx context.Context, args \[\]string) (ToolResult, error) {  
	cmd := exec.CommandContext(ctx, s.Command, args...)  
	var out bytes.Buffer  
	cmd.Stdout = &out  
	err := cmd.Run()  
	return ToolResult{Output: out.String()}, err  
}

Async tool calls are stored with a UUID and status tracking in a simple in-memory map (or persistent DB):

toolID := uuid.New().String()  
go func() {  
	result, err := tool.Run(ctx, args)  
	s.jobStore.Set(toolID, result, err)  
}()

## 🧬 Memory + Embeddings

I wanted to support both relational (MySQL) and vector-based memory (Qdrant, Pinecone).

type MemoryStore interface {  
	AddMemory(ctx context.Context, sessionID string, data MemoryItem) error  
	Search(ctx context.Context, sessionID, query string, tags \[\]string) (\[\]MemoryItem, error)  
}

A vector implementation uses an embedding provider:

embedding := embedder.Embed(query)  
results := qdrant.Search(embedding, tags)

Each memory item includes metadata, a timestamp, and an optional vector.

## 🤖 LLM Backend Switching

I abstracted LLM calls via a Model interface:

type Model interface {  
	Complete(ctx context.Context, prompt string) (string, error)  
}

With implementations for:

-   OpenAI
-   Claude
-   Ollama (local)

The user can specify which model to use per call or per session.

## 🧭 GPT as a Design Partner

I didn’t ask GPT to build the system for me. I used it like a sounding board:

-   “Should tool outputs be cached or re-executed?”
-   “How does LangChain handle memory injection?”
-   “Should I use UUIDs or hashes for job tracking?”

Its strength wasn’t codegen — it was architecture fluency. It helped me avoid rabbit holes and stay grounded in best practices while still owning every decision.

## 🔭 What’s Next

This isn’t done — it’s evolving:

-   ✅ mcp-cli REPL with prompt preview and colorized output
-   🔄 Hot-swappable model selection (via request or config)
-   🧠 Role-based memory segmentation (persona/context tracking)
-   📊 Observability layer: structured logs, tracing, async metrics
-   🌐 Web dashboard for prompt and memory visibility

Eventually, I may turn this into an open plugin system, where new tools, models, and memory backends can register dynamically.

## 🧵 Final Thoughts

Building this server from scratch taught me more than any documents or libraries could. I now understand the shape of these systems—not just how to use them but how they work, where they break, and how to adapt them.

If you’re an engineer curious about LLM operations, _build your own MCP layer._ Use GPT as your rubber duck. You’ll walk away with a system that works _and_ a deep mental model of how everything connects.

And hey, you’ll probably have more fun doing it too.

## Embedded Content

---