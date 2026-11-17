# Resume Reviewer & Interview Coach

A small agentic AI project built with **n8n**. Three AI agents work as a team:

1. **Resume Reviewer** scores the resume and suggests fixes.
2. **Gap Finder** looks up what the target role needs (using a tool) and finds the missing skills.
3. **Interview Coach** runs a 5-question mock interview, scores every answer and writes a final report.

The web pages in `frontend/` are the front end (upload, resume report, mock interview with voice, and a history page). They talk to the n8n workflow through a webhook.

## What is in this repo

| Path | What it is |
|---|---|
| `workflows/resume-coach.json` | The n8n workflow (import this) |
| `frontend/` | The web pages (open `index.html`) and `config.js`, which holds the webhook address |
| `data/roles.json` | The skills each role needs (the same data is inside the workflow's Roles Lookup tool) |
| `data/sample-resumes/` | Two sample PDF resumes to try |

## Setup (about 10 minutes)

**1. Install Node.js and download this repo.**
- Install the current **LTS** version of Node.js from nodejs.org.
- Download this repo: on GitHub click the green **Code** button, then **Download ZIP**, and extract the zip.

**2. Install and start n8n.** In a terminal (Command Prompt on Windows) run these two commands. The first takes a few minutes:

```
npm install -g n8n
n8n start
```

- Wait for the line saying the editor is accessible, then open http://localhost:5678.
- Create the local owner account when asked (any email and password). You can skip any survey or license screens.
- **Keep the terminal window open.** Closing it stops n8n.
- Yellow `warn` lines and notices about "deprecated" settings or a missing Python runner are normal. This project does not use Python, so ignore them.
- `npx n8n` also works on some machines, but on Windows it can fail while cleaning up its cache, so the commands above are more reliable.

**3. Get a free Gemini API key** from https://aistudio.google.com/apikey (sign in with a Google account). Keep the key private and never put it in a file in this repo.

**4. Import the workflow.** In n8n choose Create workflow, open the menu (the three dots at the top right), pick Import from file, and select `workflows/resume-coach.json`. Then:
- Double-click the **Gemini Model** node, create a new credential, paste your API key and save.
- Check the model name in that node. If Google has retired it, pick a current Gemini Flash model from the list.
- Click **Publish** (or turn the workflow Active, depending on your n8n version). The page only works while the workflow is active.

**5. Open the front end.** Use **Chrome or Edge** (voice input only works there). Double-click `frontend/index.html`, upload a PDF from `data/sample-resumes/`, choose a role and click **Generate Resume Report**. Then start the mock interview and answer by speaking or typing. If the browser asks to use your microphone, choose Allow.

## If something does not work

- **"Cannot reach n8n"**: n8n is not running (the terminal was closed), or the workflow is not active.
- **Webhook not found (404)**: the workflow is not active. The page uses the production URL `http://localhost:5678/webhook/resume-coach`. If yours differs, change `WEBHOOK_URL` in `frontend/config.js`.
- **Model or quota error**: the free Gemini tier has rate limits. Wait a minute and try again, or check the model name in the Gemini Model node.
- **Empty review**: the PDF is probably a scanned image. Use a text-based PDF.
- **Voice does not work**: use Chrome or Edge and allow the microphone. You can always type your answer instead.
- **Browser blocks the request**: the Webhook node allows all origins (`*`) for local use. Keep it that way when running on your own laptop.

## Make it your own

- Add or edit roles in the **Roles Lookup** node (and `data/roles.json`).
- Change how an agent behaves by editing its system message.
- Try a different model by swapping the Gemini Model node.
- Add a fourth agent, for example a cover-letter writer.

## For presenters: host n8n on Render (optional)

Use this only if n8n will not install on your laptop and you want to demo from a hosted address. Students should use the setup above.

1. Sign up at render.com, click **+ New**, then **Web Service**, then choose **Existing Image**.
2. Image URL: `docker.io/n8nio/n8n:latest`. Leave the registry credentials empty.
3. Give it a name such as `resume-coach-n8n`, pick the region closest to you and choose the **Free** instance type.
4. Add these environment variables (replace `resume-coach-n8n` with your service name):

| Name | Value |
|---|---|
| `N8N_PORT` | `10000` |
| `N8N_PROTOCOL` | `https` |
| `N8N_HOST` | `resume-coach-n8n.onrender.com` |
| `WEBHOOK_URL` | `https://resume-coach-n8n.onrender.com/` |
| `N8N_PROXY_HOPS` | `1` |
| `N8N_ENCRYPTION_KEY` | any long random text (about 32 characters). Keep a copy |

5. Click **Deploy Web Service**. In the **Logs** tab wait for the line saying the editor is accessible, then open your `onrender.com` address and create the owner account. If Render changed your service name, fix `N8N_HOST` and `WEBHOOK_URL` to match the real address and redeploy. (n8n may print a notice that `WEBHOOK_URL` is deprecated. It still works.)
6. Import `workflows/resume-coach.json`, add your Gemini credential to the **Gemini Model** node and click **Publish**.
7. In `frontend/config.js` change `WEBHOOK_URL` to `https://resume-coach-n8n.onrender.com/webhook/resume-coach`.

**Free plan limits to know:**
- A free service goes to sleep after about 15 minutes without visitors and takes about a minute to wake up. Open your address 5 minutes before a demo and keep it open.
- Its storage is temporary. After a restart, your account, workflow and API key may be gone, so keep the workflow file and your key ready and repeat steps 5 and 6.
- The free instance has only 512 MB of memory, which is tight for n8n. If the logs mention running out of memory, a paid instance is the fix.

## Version note
n8n renames models and updates AI nodes often, so if a node shows a warning after import, open it and re-select the option shown (usually the model name). The setup steps above stay the same.
