# Building Your First MCP Server: A Beginners Tutorial - DEV Community

[![Cover image for Building Your First MCP Server: A Beginners Tutorial](https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fsdykkpv3lokg71vlykri.png)](https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fsdykkpv3lokg71vlykri.png)

[![Debbie O'Brien](https://media2.dev.to/dynamic/image/width=50,height=50,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F212929%2F947ba7e0-41fe-464a-a4f3-abb66a3170c6.jpg)](/debs_obrien)

[Debbie O'Brien](/debs_obrien)

Posted on 1 jul

 ![](https://assets.dev.to/assets/sparkle-heart-5f9bee3767e18deb1bb725290cb151c25234768a0e9a2bd39370c382d02920cf.svg) 123![](https://assets.dev.to/assets/multi-unicorn-b44d6f8c23cdd00964192bedc38af3e82463978aa611b4365bd33a0f1f4f3e97.svg) 3 ![](https://assets.dev.to/assets/exploding-head-daceb38d627e6ae9b730f36a1e390fca556a4289d5a41abb2c35068ad3e2c4b5.svg) 1 ![](https://assets.dev.to/assets/raised-hands-74b2099fd66a39f2d7eed9305ee0f4553df0eb7b4f11b01b6b1b499973048fe5.svg) 3 ![](https://assets.dev.to/assets/fire-f60e7a582391810302117f987b22a8ef04a2fe0df7e3258a5f49332df1cec71e.svg) 1

# Building Your First MCP Server: A Beginners Tutorial

[#mcp](/t/mcp) [#webdev](/t/webdev) [#ai](/t/ai) [#typescript](/t/typescript)

Have you ever wanted your AI assistant to access real-time data? Model Context Protocol (MCP) servers make this possible, and they're surprisingly simple to build and use!

You may have already seen my videos and posts on using the Playwright MCP to go to a website and generate test ideas and then generate actual Playwright tests after first interacting with the site. Or how I used it to go shopping for me. This is the power of MCPs. It gives the AI agents tools to be able to do things such as connect to a browser or as in the GitHub MCP, create pull requests etc.

In this tutorial, you'll create a weather server that connects AI agents like GitHub Copilot to live weather data. We will use TypeScript for this demo but you can build MCP servers in other languages, links at the end of the post. By the end, you'll be able to ask your AI for weather information in any city and get real, up-to-date responses.

**What you'll learn:**

-   How to build an MCP server from scratch using the TypeScript SDK
-   Connect it to a real weather API
-   Integrate it with VS Code and GitHub Copilot
-   Test and debug your server

**What you'll need:**

-   Basic TypeScript/JavaScript knowledge
-   Node.js installed on your machine
-   VS Code (optional, but recommended)

Let's get started!

## [](#what-is-an-mcp-server)What is an MCP Server?

Model Context Protocol (MCP) servers are bridges that connect AI agents to external tools and data sources. Think of them as translators that help AI understand and interact with real-world applications.

**The Problem:** When you ask GitHub Copilot for weather information in VS Code, you'll get a response like this:

> "I don't have access to real-time weather data or weather APIs through the available tools in this coding environment."

**The Solution:** MCP servers provide the missing link, giving AI agents the tools they need to access live data and perform real actions.

Our weather server will act as a tool that any MCP-compatible AI can call to get current weather information for any city worldwide.

## [](#step-1-project-setup)Step 1: Project Setup

Let's create a new project and set up our development environment.

### [](#1-initialize-the-project)1\. Initialize the Project

Create a new directory and initialize it with npm:  

```
mkdir mcp-weather-server
cd mcp-weather-server
npm init -y
```

Enter fullscreen mode Exit fullscreen mode

### [](#2-create-the-main-file)2\. Create the Main File

Create our main TypeScript file:  

```
touch main.ts
```

Enter fullscreen mode Exit fullscreen mode

### [](#3-configure-packagejson)3\. Configure Package.json

Open the project in VS Code (or your preferred editor) and modify `package.json` to enable ES modules by adding the `type` field:  

```
{
  "name": "mcp-weather-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

Enter fullscreen mode Exit fullscreen mode

> **Why ES modules?** The MCP SDK uses modern JavaScript modules, so we need to enable them in our project.

## [](#step-2-install-dependencies)Step 2: Install Dependencies

Our MCP server needs two key libraries:

### [](#1-install-the-mcp-sdk)1\. Install the MCP SDK

The Model Context Protocol SDK provides everything needed to build MCP servers:  

```
npm install @modelcontextprotocol/sdk
```

Enter fullscreen mode Exit fullscreen mode

### [](#2-install-zod-for-data-validation)2\. Install Zod for Data Validation

Zod ensures our server receives valid data from AI agents:  

```
npm install zod
```

Enter fullscreen mode Exit fullscreen mode

Your `package.json` dependencies should now look like this:  

```
"dependencies": {
  "@modelcontextprotocol/sdk": "^1.13.1",
  "zod": "^3.25.67"
}
```

Enter fullscreen mode Exit fullscreen mode

## [](#step-3-building-the-basic-server)Step 3: Building the Basic Server

Now let's create our MCP server. Open `main.ts` and let's build it step by step.

### [](#1-add-the-required-imports)1\. Add the Required Imports

```
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from "zod";
```

Enter fullscreen mode Exit fullscreen mode

### [](#2-create-the-server-instance)2\. Create the Server Instance

```
const server = new McpServer({
  name: "Weather Server",
  version: "1.0.0"
});
```

Enter fullscreen mode Exit fullscreen mode

The server manages all communication using the MCP protocol between clients (like VS Code) and your tools.

### [](#3-define-your-first-tool)3\. Define Your First Tool

Tools are functions that AI agents can call. Let's create a `get-weather` tool:  

```
server.tool(
  'get-weather',
  'Tool to get the weather of a city',
  {
    city: z.string().describe("The name of the city to get the weather for")
  },
  async({ city }) => {
    // For now, return a simple static response
    return {
      content: [
        {
          type: "text",
          text: `The weather in ${city} is sunny`
        }
      ]
    };
  }
);
```

Enter fullscreen mode Exit fullscreen mode

**Breaking down the tool definition:**

1.  **Tool ID:** `'get-weather'` - Unique identifier
2.  **Description:** Helps AI agents understand what this tool does
3.  **Schema:** Defines parameters (city must be a string)
4.  **Function:** The actual code that runs when called

**How it works:**

-   AI agent sees: "Tool to get the weather of a city"
-   AI agent calls it with: `{ city: "Paris" }`
-   Zod validates the input
-   Function returns: "The weather in Paris is sunny"

### [](#4-set-up-communication)4\. Set Up Communication

Finally, we need to set up how our server communicates with AI clients:  

```
const transport = new StdioServerTransport();
server.connect(transport);
```

Enter fullscreen mode Exit fullscreen mode

**What's happening here:**

-   `StdioServerTransport` uses your terminal's input/output for communication
-   Perfect for local development
-   The server reads requests from `stdin` and writes responses to `stdout`
-   MCP protocol handles all the message formatting automatically

### [](#5-complete-basic-server-example)5\. Complete Basic Server Example

Your complete `main.ts` should now look like this:  

```
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from "zod";

const server = new McpServer({
  name: "Weather Server",
  version: "1.0.0"
});

server.tool(
  'get-weather',
  'Tool to get the weather of a city',
  {
    city: z.string().describe("The name of the city to get the weather for")
  },
  async({ city }) => {
    return {
      content: [
        {
          type: "text",
          text: `The weather in ${city} is sunny`
        }
      ]
    };
  }
);

const transport = new StdioServerTransport();
server.connect(transport);
```

Enter fullscreen mode Exit fullscreen mode

🎉 **Congratulations!** You've built your first MCP server. Let's test it!

## [](#step-4-testing-with-mcp-inspector)Step 4: Testing with MCP Inspector

Before adding real weather data, let's test our server using the MCP Inspector, a web-based debugging tool for MCP servers.

### [](#launch-the-inspector)Launch the Inspector

Run this command to open the MCP Inspector for your server:  

```
npx -y @modelcontextprotocol/inspector npx -y tsx main.ts 
```

Enter fullscreen mode Exit fullscreen mode

After running the command, you'll see terminal output with:

-   A localhost URL (like `http://127.0.0.1:6274`)
-   A unique session token
-   A direct link with the token pre-filled

[![MCP inspector configuration](https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F86yzlhhxfxec63ljw76k.png)](https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F86yzlhhxfxec63ljw76k.png)

**💡 Tip:** Click the link with the token already included to avoid manual entry.

### [](#connect-and-test)Connect and Test

1.  **Connect:** Click the "Connect" button in the Inspector
2.  **Navigate:** Click "Tools" in the top navigation
3.  **Select:** Choose your `get-weather` tool
4.  **Test:** Enter a city name (like "Palma de Mallorca") and click "Run Tool"

You should see the response: `"The weather in Palma de Mallorca is sunny"`

[![mcp inspector get wether tool and see response](https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F1d4nu6lcv0prjxqvukt2.png)](https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F1d4nu6lcv0prjxqvukt2.png)

**Troubleshooting:**

-   **Connection Error?** Make sure you used the link with the pre-filled token

Perfect! Your MCP server is working. Now let's make it actually useful.

## [](#step-5-adding-real-weather-data)Step 5: Adding Real Weather Data

Time to make our server actually useful! We'll integrate with [Open-Meteo](https://open-meteo.com/), a free weather API that requires no API key.

### [](#how-the-weather-api-works)How the Weather API Works

To get weather data, we need a two-step process:

1.  **Convert city name → coordinates** (using the Geocoding API)
2.  **Get weather using coordinates** (using the Weather API)

### [](#update-your-tool-function)Update Your Tool Function

Replace your existing tool function with this enhanced version:  

```
server.tool(
  'get-weather',
  'Tool to get the weather of a city',
  {
    city: z.string().describe("The name of the city to get the weather for")
  },
  async({ city }) => {
    try {
      // Step 1: Get coordinates for the city
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`
      );
      const geoData = await geoResponse.json();

      // Handle city not found
      if (!geoData.results || geoData.results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `Sorry, I couldn't find a city named "${city}". Please check the spelling and try again.`
            }
          ]
        };
      }

      // Step 2: Get weather data using coordinates
      const { latitude, longitude } = geoData.results[0];
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code&hourly=temperature_2m,precipitation&forecast_days=1`
      );

      const weatherData = await weatherResponse.json();

      // Return the complete weather data as JSON
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(weatherData, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching weather data: ${error.message}`
          }
        ]
      };
    }
  }
);
```

Enter fullscreen mode Exit fullscreen mode

### [](#test-the-real-data)Test the Real Data

1.  **Restart** your MCP Inspector (Ctrl+C, then re-run the command)
2.  **Reconnect** in the web interface
3.  **Test** with a real city like "Tokyo" or "New York"

You should now see actual weather data instead of "sunny"! 🌤️

[![mcp inspector showing tokyo data returned](https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fmeqh8cvyo6glns8l588w.png)](https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fmeqh8cvyo6glns8l588w.png)

## [](#step-6-integration-with-vs-code-and-github-copilot)Step 6: Integration with VS Code and GitHub Copilot

Now let's connect your weather server to VS Code so you can use it with GitHub Copilot!

### [](#register-the-server)Register the Server

1.  **Open Command Palette:** `Cmd/Ctrl + Shift + P`
2.  **Type:** `MCP: Add Server`
3.  **Choose:** "Local server using stdio"
4.  **Enter Command:** `npx -y tsx main.ts`
5.  **Name:** `my-weather-server`
6.  **Setup Type:** Local setup

This creates a `.vscode/mcp.json` file in your project:  

```
{
  "inputs": [],
  "servers": {
    "my-weather-server": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "tsx",
        "/Users/your-username/path/to/main.ts"
      ]
    }
  }
}
```

Enter fullscreen mode Exit fullscreen mode

### [](#start-and-test)Start and Test

1.  **Start the server:** Click the "Start" button next to your server name in the MCP panel
2.  **Verify:** You should see "Running" status
3.  **Switch to Agent Mode:** Click the Copilot sidebar → "Agent Mode"
4.  **Ask:** "What's the weather like in Tokyo?"

GitHub Copilot will ask permission to use your weather tool, click "Continue" to proceed.

**Expected Result:** Instead of raw JSON, you'll get a beautifully formatted weather report like this:  

```
> **Weather in Tokyo Today**  
> **Temperature:** 28°C (feels like 32°C)  
> **Humidity:** 75%  
> **Conditions:** Partly cloudy with light rain expected in the evening
```

Enter fullscreen mode Exit fullscreen mode

**Perfect!** The AI transforms your raw weather data into a beautiful, human-readable format automatically.

## [](#why-this-is-powerful)Why This is Powerful

Your weather server demonstrates the true power of MCP:

**🤖 AI Does the Heavy Lifting**

-   You provide raw data, AI creates beautiful presentations
-   No need to format responses, the AI handles user experience

**🔗 Universal Compatibility**

-   Works with any MCP-compatible tool (VS Code, Claude, etc.)
-   Write once, use everywhere

**⚡ Real-time Integration**

-   Always current data, no caching issues
-   Works seamlessly within your development environment

**📈 Easy to Extend**

-   Add weather alerts, forecasts, or air quality data
-   Build additional tools in the same server

## [](#complete-code-reference)Complete Code Reference

Here's your final `main.ts` file:  

```
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from "zod";

const server = new McpServer({
  name: "Weather Server",
  version: "1.0.0"
});

server.tool(
  'get-weather',
  'Tool to get the weather of a city',
  {
    city: z.string().describe("The name of the city to get the weather for")
  },
  async({ city }) => {
    try {
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=en&format=json`);
      const data = await response.json();

      if (data.results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No results found for city: ${city}`
            }
          ]
        };
      }

      const { latitude, longitude } = data.results[0];
      const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation,apparent_temperature,relative_humidity_2m&forecast_days=1`);

      const weatherData = await weatherResponse.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(weatherData, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching weather data: ${error.message}`
          }
        ]
      };
    }
  }
);

const transport = new StdioServerTransport();
server.connect(transport);
```

Enter fullscreen mode Exit fullscreen mode

## [](#next-steps-enhance-your-server)Next Steps: Enhance Your Server

Ready to take your weather server to the next level? Here are some ideas:

### [](#additional-weather-tools)🚀 Additional Weather Tools

**Extended Forecasts**  

```
server.tool('get-forecast', 'Get 7-day weather forecast', ...)
```

Enter fullscreen mode Exit fullscreen mode

**Weather Alerts**  

```
server.tool('get-alerts', 'Get severe weather warnings', ...)
```

Enter fullscreen mode Exit fullscreen mode

**Air Quality**  

```
server.tool('get-air-quality', 'Get air pollution data', ...)
```

Enter fullscreen mode Exit fullscreen mode

### [](#sharing-your-server)📦 Sharing Your Server

-   **Publish to NPM:** Make it available for others to use

## [](#conclusion)Conclusion

🎉 **Congratulations!** You've successfully built your first MCP weather server!

**What You've Accomplished:**

-   ✅ Created a functional MCP server from scratch
-   ✅ Integrated real-time weather data from an external API
-   ✅ Connected it to VS Code and GitHub Copilot
-   ✅ Learned the fundamentals of the Model Context Protocol

**Key Takeaways:**

-   **Simplicity:** MCP servers are much easier to build than they appear
-   **Power:** Real data makes AI interactions dramatically more valuable
-   **Flexibility:** The same server works across multiple AI platforms
-   **Future-ready:** You're building the infrastructure for next-gen AI

**What's Next?** The possibilities are endless! Weather was just the beginning, now you can connect AI to databases, APIs, file systems, and any service you can imagine.

Happy building! 🚀

## [](#resources-and-further-reading)📚 Resources and Further Reading

**Official Documentation**

-   [Model Context Protocol Documentation](https://modelcontextprotocol.io/) - Complete MCP reference
-   [TypeScripT SDK](https://github.com/modelcontextprotocol/typescript-sdk)
-   [Python SDK](https://github.com/modelcontextprotocol/python-sdk)
-   [Java SDK](https://github.com/modelcontextprotocol/java-sdk)
-   [Kotlin SDK](https://github.com/modelcontextprotocol/kotlin-sdk)
-   [C# SDK](https://github.com/modelcontextprotocol/csharp-sdk)

**APIs Used in This Tutorial**

-   [Open-Meteo Weather API](https://open-meteo.com/) - Free weather data service
-   [Zod Documentation](https://zod.dev/) - TypeScript schema validation

**MCP Examples**

-   [MCP Examples Repository](https://github.com/modelcontextprotocol/servers) - Sample servers
-   [Playwright MCP](https://github.com/microsoft/playwright-mcp) -Provides browser automation capabilities using Playwright.
-   [GitHub MCP](https://docs.github.com/en/copilot/how-tos/context/model-context-protocol/using-the-github-mcp-server)

**Demo Repo**  
[Demo available on GitHub](https://github.com/debs-obrien/mcp-weather-server-demo)

**Watch the Video**  

<iframe width="710" height="399" src="https://www.youtube.com/embed/egVm_z1nnnQ" allowfullscreen="" loading="lazy" class=" fluidvids-elem"></iframe>

Shoutout to Miguel Angel Duran for his great course and explanation. Check out his video in Spanish for a similar demo: [Learn MCP! For Beginners + Create Our First MCP From Scratch”](https://youtu.be/wnHczxwukYY?si=6TlZiYpc_XKkn46v)

DEV Community Surveys ❤️

Dropdown menu

-   [What's a billboard?](/billboards)
-   [Manage preferences](/settings/customization#sponsors)
-   [Edit billboard](/admin/customization/billboards/242294/edit)

---

-   [Report billboard](/report-abuse?billboard=242294)

### [](#please-help-our-partners-improve-ai-tooling-by-completing-this-very-short-survey)Please help our partners improve AI tooling by completing this _very short_ survey:

## Google AI User Experience Survey

### Please choose the point that best applies to you for Google AI.  
  
**(1)** It is very _difficult_ to navigate their different AI offerings  
  
**(7)** It is very _easy_ to navigate their different AI offerings

← Very difficult to navigate

Very easy to navigate →

-    1 Very difficult to navigate
-    2
-    3
-    4
-    5
-    6
-    7 Very easy to navigate

✓ Thank you for your response.

✓ Thank you for completing the survey!

### Please choose the point that best applies to you for Google AI.  
  
**(1)** Their set of AI tools and models are _not at all comprehensive_ for meeting my development needs  
  
**(7)** Their set of AI tools and models are _extremely comprehensive_ for meeting my development needs

← Not at all comprehensive

Extremely comprehensive →

-    1 Not at all comprehensive
-    2
-    3
-    4
-    5
-    6
-    7 Extremely comprehensive

✓ Thank you for your response.

✓ Thank you for completing the survey!

### Please choose the point that best applies to you for Google AI.  
  
**(1)** Their AI tools and models do _not work together very well_ as part of a cohesive ecosystem  
  
**(7)** Their AI tools and models _work together very well_ as part of a cohesive ecosystem

← Do not work together well

Work together very well →

-    1 Do not work together well
-    2
-    3
-    4
-    5
-    6
-    7 Work together very well

✓ Thank you for your response.

✓ Thank you for completing the survey!

### Please choose the point that best applies to you for Google AI.  
  
**(1)** It is very _hard_ to find a suitable AI tool or model for a specific task  
  
**(7)** It is very _easy_ to find a suitable AI tool or model for a specific task

← Very hard to find

Very easy to find →

-    1 Very hard to find
-    2
-    3
-    4
-    5
-    6
-    7 Very easy to find

✓ Thank you for your response.

✓ Thank you for completing the survey!

### Please choose the point that best applies to you for Google AI.  
  
**(1)** The pace at which they introduce new AI features and models feels _overwhelming_  
  
**(7)** The pace at which they introduce new AI features and models feels _manageable_

← Pace feels overwhleming

Pace feels manageable →

-    1 Pace feels overwhleming
-    2
-    3
-    4
-    5
-    6
-    7 Pace feels manageable

✓ Thank you for your response.

✓ Thank you for completing the survey!

### What size organization do you belong to?

-    Just me (solo)
-    2–10 people
-    11–50 people
-    51–250 people
-    251–500 people
-    501–1,000 people
-    1,001–5,000 people
-    5,001+ people

✓ Thank you for your response.

✓ Thank you for completing the survey!

← Previous Question 1 of 6 Next →

### Survey completed

_**None of your personal information will be shared.** Once you complete the survey you will not be prompted for completion anymore._

**Thank you!! ❤️**

## Top comments (6)

Crown

Subscribe

    ![pic](https://media2.dev.to/dynamic/image/width=90,height=90,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F1885216%2F68c935f4-1661-40c4-bb6f-c7ef7de9ebd9.png)

Personal Trusted User

[Create template](/settings/response-templates)

Templates let you quickly answer FAQs or store snippets for re-use.

Submit Preview [Dismiss](/404.html)

Are you sure you want to hide this comment? It will become hidden in your post, but will still be visible via the comment's [permalink](#).

Hide child comments as well

Confirm

For further actions, you may consider blocking this person and/or [reporting abuse](/report-abuse)

[![profile](https://media2.dev.to/dynamic/image/width=64,height=64,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Forganization%2Fprofile_image%2F123%2F38b10714-65da-4f1d-88ae-e9b28c1d7a5e.png)

Heroku

](/heroku)Promoted

Dropdown menu

-   [What's a billboard?](/billboards)
-   [Manage preferences](/settings/customization#sponsors)
-   [Edit billboard](/admin/customization/billboards/237761/edit)

---

-   [Report billboard](/report-abuse?billboard=237761)

[![Heroku](https://media2.dev.to/dynamic/image/width=775%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fi.imgur.com%2FkJrNNHc.png)](https://www.heroku.com/blog/improved-my-productivity-cursor-and-heroku-mcp-server/?utm_source=devto&utm_medium=paid&utm_campaign=heroku_2025&bb=237761)

## [](#tired-of-jumping-between-terminals-dashboards-and-code)[Tired of jumping between terminals, dashboards, and code?](https://www.heroku.com/blog/improved-my-productivity-cursor-and-heroku-mcp-server/?utm_source=devto&utm_medium=paid&utm_campaign=heroku_2025&bb=237761)

Check out this demo showcasing how tools like Cursor can connect to Heroku through the MCP, letting you trigger actions like deployments, scaling, or provisioning—all without leaving your editor.

[Learn More](https://www.heroku.com/blog/improved-my-productivity-cursor-and-heroku-mcp-server/?utm_source=devto&utm_medium=paid&utm_campaign=heroku_2025&bb=237761)

## Embedded Content